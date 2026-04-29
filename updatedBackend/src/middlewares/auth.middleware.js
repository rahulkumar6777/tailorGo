import jwt from 'jsonwebtoken';
import { ENV } from '../lib/env.js';
import { redisClient } from '../core/redis/redis.js';


export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.AccessToken;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const { _id: userId, tokenId, role } = decoded;

        if (!userId || !tokenId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        
        const sessionKey = `session:${userId}:${tokenId}`;
        const sessionData = await redisClient.get(sessionKey);

        if (!sessionData) {
            return res.status(401).json({
                message: 'Session expired or logged out'
            });
        }

        
        req.user = {
            _id: userId,
            tokenId,
            role
        };

        next();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};