import { userRegisterInitService, userRegisterVerifyService } from "../services/register.service.js";
import { validationResult } from 'express-validator';

export const userRegisterInitController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        };


        const userData = req.body;
        const newUser = await userRegisterInitService(userData);


        res.status(201).json({
            success: true,
            message: 'Otp send SuccessFully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const userRegisterVerifyController = async (req, res) => {
    try {
        const { email, code } = req.body;
        const verifiedUser = await userRegisterVerifyService(email, code);
        res.status(200).json({ 
            success: true,
            message: 'User verified successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}