import { verificationQueue, welcomeQueue } from "../../../shared/queue/queues.js";
import { registerInitTailor, registerverifyTailor } from "../services/register.service.js";
import { validationResult } from 'express-validator';
import fs from 'fs'

const enqueueWelcomeEmail = (tailor) => {
    welcomeQueue.add('welcome-email', {
        fullname: tailor.fullName,
        email: tailor.email,
        role: 'tailor'
    }).catch((error) => {
        console.log('Welcome email queue error', error.message);
    });
}

const cleanupLocalUploads = (files = {}) => {
    const uploadedFiles = [
        ...(files.verificationPhotos || []),
        ...(files.workExperiencePhotos || [])
    ];

    for (const file of uploadedFiles) {
        if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    }
}

export const tailorInitRegister = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            cleanupLocalUploads(req.files);
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        };

        const tailorData = req.body;

        await registerInitTailor(tailorData, req.files);

        return res.status(201).json({
            success: true,
            message: "Otp send Successfully"
        });


    } catch (error) {

        cleanupLocalUploads(req.files);

        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export const tailorRegisterVerify = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, code } = req.body;

        const tailor = await registerverifyTailor(email, code);
        const queueData = {
            tailorId: tailor._id.toString(),
            fullname: tailor.fullName,
            email: tailor.email,
            age: tailor.age,
            yearsOfExperience: tailor.yearsOfExperience,
            workExperiencePhotos: tailor.workExperiencePhotos.map(p => p.photo),
            verificationPhotos: tailor.verificationPhotos.map(p => p.photo),
            verificationType: tailor.verificationType
        };


        verificationQueue.add('verificationqueue', queueData).catch((error) => {
            console.log('Tailor verification email queue error', error.message);
        });
        enqueueWelcomeEmail(tailor);


        return res.json({
            success: true,
            message: "Account activated"
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
