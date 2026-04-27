import mongoose from "mongoose";
import { ENV } from "../../lib/env.js";

export const connectDb = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}