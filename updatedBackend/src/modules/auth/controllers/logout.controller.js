import jwt from 'jsonwebtoken';
import { redisClient } from '../../../core/redis/redis.js';
import { ENV } from '../../../lib/env.js';
import { getClearAccessTokenOptions, getClearRefreshTokenOptions } from '../../../shared/auth/cookieOption.js';

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies?.AccessToken;

        if (token) {
            try {
                const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);

                if (decoded?._id && decoded?.tokenId) {
                    await redisClient.del(`session:${decoded._id}:${decoded.tokenId}`);
                }
            } catch {
                // Even with an expired/invalid access token, clear browser cookies.
            }
        }

        return res
            .clearCookie('AccessToken', getClearAccessTokenOptions())
            .clearCookie('refreshToken', getClearRefreshTokenOptions())
            .status(200)
            .json({ message: 'Logout success' });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Logout failed' });
    }
};
