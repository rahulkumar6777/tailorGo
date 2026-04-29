import { validationResult } from "express-validator";
import { changeUsername } from "../services/chnageUsername.service.js"

export const chageUsernameController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        }

        const userId = req.user._id;
        const username = req.body.username;

        const response = await changeUsername(userId, username);

        return res.status(200).json({
            success: true,
            data: response
        })

    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server Error"
        })
    }
}