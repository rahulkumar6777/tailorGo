import { registerInitTailor , registerverifyTailor } from "../services/register.service.js";
import { validationResult } from 'express-validator';

export const tailorInitRegister = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        };

        const tailorData = req.body;

        await registerInitTailor(tailorData);

        return res.status(201).json({
            success: true,
            message: "Otp send Successfully"
        });


    } catch (error) {

        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export const tailorRegisterVerify = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, code } = req.body;

        await registerverifyTailor(email, code);

        return res.json({
            success: true,
            message: "Account activated"
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};