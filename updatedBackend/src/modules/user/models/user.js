import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ENV } from "../../../lib/env.js";

const userSchema = new mongoose.Schema({
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
    pnoneNo: {
        type: String,
        trim: true,
        match: /^\d{10}$/
    },
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
        enum: ['customer'],
        default: 'customer'
    },
    referralCode: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: 'pending'
    },
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12)
    }
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.GenerateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role
    }, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: ENV.ACCESS_TOKEN_EXPIRY
    })
}


userSchema.methods.GenerateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role
    }, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: ENV.REFRESH_TOKEN_EXPIRY
    })
}


export const User = mongoose.model('User', userSchema);