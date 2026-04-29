import { getAccessTokenOptions, getRefreshTokenOptions } from "../../../shared/auth/cookieOption.js";
import { refreshTokenService } from "../services/refreshToken.service.js";


export const refreshTokenController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        const result = await refreshTokenService({
            refreshToken,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        return res
            .cookie('refreshToken', result.RefreshToken, getRefreshTokenOptions())
            .cookie('AccessToken', result.AccessToken, getAccessTokenOptions())
            .json({ accessToken: result.AccessToken });

    } catch (err) {
        if (!err.status || err.status >= 500) {
            console.error(err);
        }

        return res.status(err.status || 500).json({
            message: err.message || 'Internal Server Error'
        });
    }
};
