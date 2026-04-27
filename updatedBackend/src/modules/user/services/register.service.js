import { model } from "../../../models/index.js";
import { sendOtp } from "../../../shared/email/sendOtp.js";
import { generateReferralCode } from "../../../utils/generateReferralCode.js";

export const userRegisterInitService = async (userData) => {

    try {

        const { name, email, phoneNo, password } = userData;
        const existingUser = await model.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const referralCode = generateReferralCode();

        const newUser = new model.User({
            fullName: name,
            email,
            phoneNo,
            password,
            referralCode
        });

        await sendOtp(email, 'customer');

        await newUser.save();

        return newUser;


    } catch (error) {
        throw error;
    }

}


export const userRegisterVerifyService = async (email, code) => {
    try {


        const otpRecord = await model.OtpValidate.findOne({ email });

        if (!otpRecord || otpRecord.code !== code) {
            throw new Error("Invalid or expired code");
        }

        const user = await model.User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        };

        user.status = "active";
        await user.save();

        await model.OtpValidate.deleteOne({ email });

        return user;
    } catch (error) {
        throw error;
    }
}