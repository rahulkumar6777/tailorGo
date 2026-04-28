import { model } from '../../../models/index.js';
import { sendOtp } from '../../../shared/email/sendOtp.js';
import { uploadOnCloudinary } from "../../../shared/cloudinary/cloudinary.service.js";
import * as crypto from 'crypto'

const normalizeVerificationType = (verificationType) => {
    if (verificationType === 'adharCard') return 'aadharCard';
    return verificationType;
}

function generateRandomAlphabets(length = 6) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        const index = bytes[i] % alphabet.length;
        result += alphabet[index];
    }

    return result;
}

export const registerInitTailor = async (tailorData, files = {}) => {
    try {


        const { name, email, phoneNo, password, shopName, shopAddress, servicesOffered, verificationType, age, gender, experience, coordinates } = tailorData;
        const { lat, lng } = tailorData.coordinates;
        const verificationPhotos = files.verificationPhotos || [];
        const workExperiencePhotos = files.workExperiencePhotos || [];

        const existingTailor = await model.Tailor.findOne({ email });
        if (existingTailor) {
            throw new Error("Tailor with this email already exists");
        }


        const randomwords = generateRandomAlphabets(6)
        const username = shopName.toLowerCase().replace(/\s+/g, '') + randomwords.toLowerCase();


        const newTailor = new model.Tailor({
            fullName: name,
            username,
            email,
            phoneNo,
            password,
            shopName,
            shopAddress,
            servicesOffered,
            verificationType: normalizeVerificationType(verificationType),
            age,
            gender,
            yearsOfExperience: experience,
            shopCoordinates: {
                type: "Point",
                coordinates: [lng, lat],
            }
        });


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

