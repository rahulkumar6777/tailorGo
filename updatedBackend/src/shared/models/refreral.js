import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    referrar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    referee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tailor"
    }
}, { timestamps: true});


export const Referral = mongoose.model("Referral", referralSchema);