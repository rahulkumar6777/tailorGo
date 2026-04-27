import { model } from "../../../models/index.js";

export const tailorLoginService = async (loginData) => {
    try {

        const { email, password } = loginData

        const user = await model.Tailor.findOne({ email });
        if (!user) {
            throw new Error('user not exist with this email')
        }

        const checkpass = await user.comparePassword(password);
        if (!checkpass) {
            throw new Error('Invalid password')
        }

        return user;
    } catch (error) {
        throw error;
    }
}