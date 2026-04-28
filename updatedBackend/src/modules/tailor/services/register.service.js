import { model } from '../../../models/index.js';
import { sendOtp } from '../../../shared/email/sendOtp.js';
import { uploadOnCloudinary } from "../../../shared/cloudinary/cloudinary.service.js";

export const registerInitTailor = async (tailorData, files) => {
    try {

        if (!files || !tailorData) {
            throw new Error('files and tailorData is required')
        }
        const { name, email, phoneNo, password, shopName, shopAddress, servicesOffered, verificationType, age, gender, experience } = tailorData;

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
            gender,
            yearsOfExperience: experience
        });

        // verification photos
        if (files.verificationPhotos) {
            for (const file of files.verificationPhotos) {
                const response = await uploadOnCloudinary(file.path);
                newTailor.verificationPhotos.push({
                    photo: response.url,
                    photoPublicId: response.public_id
                });
            }
        }

        // work experience photos
        if (files.workExperiencePhotos) {
            for (const file of files.workExperiencePhotos) {
                const response = await uploadOnCloudinary(file.path);
                newTailor.workExperiencePhotos.push({
                    photo: response.url,
                    photoPublicId: response.public_id
                });
            }
        }

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

        return tailor;
    } catch (error) {
        throw error
    }
}

