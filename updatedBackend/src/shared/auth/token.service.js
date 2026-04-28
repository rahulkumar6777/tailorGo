import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { redisClient } from '../../core/redis/redis.js';
import { ENV } from '../../lib/env.js';


const extractDevice = (ua = '') => {
    ua = ua.toLowerCase();

    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows')) return 'Windows PC';
    if (ua.includes('mac')) return 'Mac';
    if (ua.includes('linux')) return 'Linux';

    return 'Unknown Device';
};

export const GenerateToken = async (userId, req, role) => {
    const tokenId = crypto.randomUUID();

    const refreshToken = jwt.sign(
        { _id: userId, role },
        ENV.REFRESH_TOKEN_SECRET,
        {
            expiresIn: ENV.REFRESH_TOKEN_EXPIRY,
            jwtid: tokenId
        }
    );

    const hashedToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    const sessionKey = `session:${userId}:${tokenId}`;

    await redisClient.set(
        sessionKey,
        JSON.stringify({
            hashedToken,
            ip: req?.ip || '',
            userAgent: req?.headers?.['user-agent'] || '',
            device: extractDevice(req?.headers?.['user-agent']),
            createdAt: Date.now(),
            role
        }),
        'EX',
        60 * 60 * 24 * 7
    );

    const accessToken = jwt.sign(
        { _id: userId, role, tokenId },
        ENV.ACCESS_TOKEN_SECRET,
        { expiresIn: ENV.ACCESS_TOKEN_EXPIRY }
    );

    return {
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        tokenId
    };
};