import { model } from '../../../models/index.js';
import { sendOtp } from '../../../shared/email/sendOtp.js';

export const registerInitTailor = async (tailorData) => {
    try {

        const { name, email, phoneNo, password, shopName, shopAddress, servicesOffered, verificationType, age, gender } = tailorData;

        const existingTailor = await model.Tailor.findOne({ email });
        if (existingTailor) {
            throw new Error("Tailor with this email already exists");
        }

        const newTailor = new model.Tailor({
            fullName: name,
            email,
            phoneNo,
            password,
            shopName,
            shopAddress,
            servicesOffered,
            verificationType,
            age,
            gender
        });

        await sendOtp(email, 'tailor')

        await newTailor.save();

        return newTailor;

    } catch (error) {
        throw error
    }
}

export const registerverifyTailor = async (email, code) => {
    try {
        const otp = await model.OtpValidate.findOne({ email, userType: "tailor" });

        if (!otp || otp.code !== code) {
            throw new Error("Invalid or expired code");
        }

        const tailor = await model.Tailor.findOne({ email });
        if (!tailor) throw new Error("Tailor not found");

        tailor.status = "active";
        await tailor.save();

        await model.OtpValidate.deleteOne({ email });

        return true;
    } catch (error) {
        throw error
    }
}

