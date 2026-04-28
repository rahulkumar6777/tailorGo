import { tailorLoginService } from "../services/login.service.js";
import { GenerateToken } from "../../../shared/auth/token.service.js";
import { validationResult } from "express-validator";
import { getAccessTokenOptions, getRefreshTokenOptions } from "../../../shared/auth/cookieOption.js";

export const tailorLoginController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        }

        const user = await tailorLoginService(req.body);
        if (user.verificationStatus !== 'verified') {
            return res.status(403).json({
                message: "Please Verify your Account"
            })
        }

        const { RefreshToken, AccessToken } = await GenerateToken(user._id, req, user?.role);

        return res
            .cookie('refreshToken', RefreshToken, getRefreshTokenOptions)
            .cookie('AccessToken', AccessToken, getAccessTokenOptions)
            .status(200)
            .json({
                message: "Login success",
                status: true
            })

    } catch (error) {
        return res.status(400).json({
            error: error.message
        })
    }
}