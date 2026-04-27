import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { redisClient } from '../../core/redis/redis.js';
import { ENV } from '../../lib/env.js';

export const GenerateToken = async (userId, req , role) => {
    const tokenId      = crypto.randomUUID()
    const refreshToken = crypto.randomBytes(64).toString('hex')
    const hashedToken  = crypto.createHash('sha256').update(refreshToken).digest('hex')

    
    await redisClient.setex(
        `session:${userId}:${tokenId}`,
        60 * 60 * 24 * 7,
        JSON.stringify({
            hashedToken,
            ip:        req?.ip || '',
            userAgent: req?.headers?.['user-agent'] || '',
            createdAt: Date.now(),
        })
    )

    const accessToken = jwt.sign(
        { _id: userId, tokenId  , role}, 
        ENV.ACCESS_TOKEN_SECRET,
        { expiresIn: ENV.ACCESS_TOKEN_EXPIRY }
    )

    return { AccessToken: accessToken, RefreshToken: refreshToken, tokenId }
}