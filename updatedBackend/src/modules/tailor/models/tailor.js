import mongoose from "mongoose";
import { ENV } from "../../../lib/env.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const tailorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    phoneNo: {
        type: String,
        trim: true,
        match: /^\d{10}$/
    },
    yearsOfExperience: {
        type: Number,
    },
    workExperiencePhotos: [
        {
            photo: {
                type: String
            },
            photoPublicId: {
                type: String
            }
        }
    ],
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    avatar: {
        type: String,
    },
    avatarPublicId: {
        type: String,
    },
    role: {
        type: String,
        enum: ['tailor'],
        default: 'tailor'
    },
    age: {
        type: Number,
        min: 18,
        max: 70
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },

    // businessdetails
    shopName: {
        type: String,
        required: true
    },
    shopAddress: {
        type: String
    },

    // type of tailoring services offered
    servicesOffered: [
        {
            serviceType: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],

    // verification type and status

    verificationType: {
        type: String,
        enum: ['aadharCard', 'voterId'],
        required: true
    },
    verificationPhotos: [
        {
            photo: {
                type: String
            },
            photoPublicId: {
                type: String
            }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: 'pending'
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
});


tailorSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12)
    }
});


tailorSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


tailorSchema.methods.GenerateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role
    }, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: ENV.ACCESS_TOKEN_EXPIRY
    })
};


tailorSchema.methods.GenerateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role
    }, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: ENV.REFRESH_TOKEN_EXPIRY
    })
};


export const Tailor = mongoose.model("Tailor", tailorSchema);