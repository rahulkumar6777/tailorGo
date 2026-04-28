import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { redisClient } from '../../core/redis/redis.js';
import { ENV } from '../../lib/env.js';

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

    await redisClient.setEx(
        sessionKey,
        60 * 60 * 24 * 7,
        JSON.stringify({
            hashedToken,
            ip: req?.ip || '',
            userAgent: req?.headers?.['user-agent'] || '',
            device: extractDevice(req?.headers?.['user-agent']),
            createdAt: Date.now(),
            role
        })
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