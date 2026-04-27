import { transporter } from "./transporter.js";
import { model } from "../../models/index.js";
import { generateSixDigitCode as generateCode } from '../../utils/generateSixDigitCode.js';
import { ENV } from "../../lib/env.js";

const saveCodeToDB = async (email, userType) => {
    try {
        const code = generateCode();

        await model.OtpValidate.findOneAndUpdate(
            { email, userType },
            { code, createdAt: new Date() },
            { upsert: true, returnDocument: "after" }
        );

        return code;
    } catch (error) {
        return error;
    }
};

const sendRegistrationCode = async (email, userType) => {
    const code = await saveCodeToDB(email, userType);

    const mailOptions = {
        from: `"TailorGo" <${ENV.EMAIL_USER}>`,
        to: email,
        subject: "Your Registration Code",
        html: `<h2>Your OTP is: ${code}</h2>`
    };

    await transporter.sendMail(mailOptions);
};

export const sendOtp = async (email, userType) => {
    await sendRegistrationCode(email, userType);
}