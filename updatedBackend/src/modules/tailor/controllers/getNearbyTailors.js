import { validationResult } from "express-validator";
import { getNearbyTailors } from "../services/getNearbyTailors.service.js"

export const getNearbyTailorsController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        }

        const response = await getNearbyTailors(req.query);

        

        res.status(200).json({
            success: true,
            data: response
        })

    } catch (error) {
        return res.status(error?.status || 500).json({
            message: error.message || 'Internal server Error'
        })
    }
}