import { tailorProfile } from "../services/profile.seervice.js";

export const tailorProfileControllers = async (req, res) => {
    try {

        const data = req.params;


        const response = await tailorProfile(data);

        res.status(200).json({
            success: true,
            data: response
        })

    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).json({
            message: error.message || 'Internal Server Error'
        });
    }
}