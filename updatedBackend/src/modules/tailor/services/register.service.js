import { model } from '../../../models/index.js';
import { sendOtp } from '../../../shared/email/sendOtp.js';
import { uploadOnCloudinary } from "../../../shared/cloudinary/cloudinary.service.js";

const normalizeVerificationType = (verificationType) => {
    if (verificationType === 'adharCard') return 'aadharCard';
    return verificationType;
}

export const registerInitTailor = async (tailorData, files = {}) => {
    try {


        const { name, email, phoneNo, password, shopName, shopAddress, servicesOffered, verificationType, age, gender, experience } = tailorData;
        const verificationPhotos = files.verificationPhotos || [];
        const workExperiencePhotos = files.workExperiencePhotos || [];

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
            verificationType: normalizeVerificationType(verificationType),
            age,
            gender,
            yearsOfExperience: experience
        });

        console.log('rached 1')
        // verification photos
        if (verificationPhotos.length) {
            for (const file of verificationPhotos) {
                const response = await uploadOnCloudinary(file.path);
                console.log(response)
                newTailor.verificationPhotos.push({
                    photo: response.secure_url || response.url,
                    photoPublicId: response.public_id
                });
            }
        }

        console.log('rached 2')
        // work experience photos
        if (workExperiencePhotos.length) {
            for (const file of workExperiencePhotos) {
                const response = await uploadOnCloudinary(file.path);
                newTailor.workExperiencePhotos.push({
                    photo: response.secure_url || response.url,
                    photoPublicId: response.public_id
                });
            }
        }

        console.log('rached 3')
        await sendOtp(email, 'tailor')

        await newTailor.save();

        console.log('rached 5')
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

        return tailor;
    } catch (error) {
        throw error
    }
}

