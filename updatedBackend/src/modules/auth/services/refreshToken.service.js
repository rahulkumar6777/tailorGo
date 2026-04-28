import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redisClient } from '../../../core/redis/redis.js';
import { GenerateToken } from '../../../shared/auth/token.service.js';
import { ENV } from '../../../lib/env.js';


const deleteAllSessions = async (userId) => {
    const pattern = `session:${userId}:*`;
    let cursor = '0';

    do {
        const [nextCursor, keys] = await redisClient.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            100
        );

        cursor = nextCursor;

        if (keys.length > 0) {
            await redisClient.del(...keys);
        }

    } while (cursor !== '0');
};

export const refreshTokenService = async ({ refreshToken, ip, userAgent }) => {
    if (!refreshToken) {
        throw { status: 401, message: 'No refresh token' };
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET);
    } catch {
        throw { status: 401, message: 'Invalid refresh token' };
    }

    const userId = payload._id;
    const tokenId = payload.jti;

    if (!tokenId) {
        throw { status: 401, message: 'Invalid token payload' };
    }

    const sessionKey = `session:${userId}:${tokenId}`;
    const sessionData = await redisClient.get(sessionKey);

    if (!sessionData) {
        throw { status: 401, message: 'Session expired' };
    }

    const session = JSON.parse(sessionData);

    const incomingHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    
    if (incomingHash !== session.hashedToken) {
        await deleteAllSessions(userId);

        throw {
            status: 403,
            message: 'Token reuse detected. All sessions revoked.'
        };
    }


    if (session.ip && session.ip !== ip) {
        console.warn('⚠️ IP mismatch', {
            old: session.ip,
            new: ip
        });
    }

    
    await redisClient.del(sessionKey);

    const tokens = await GenerateToken(
        userId,
        { ip, headers: { 'user-agent': userAgent } },
        session.role
    );

    return tokens;
};