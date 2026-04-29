import { model } from "../../../models/index.js";

export const changeUsername = async ({ userId, username }) => {

    const exists = await model.Tailor.exists({ username });
    if (exists) {
        const err = new Error("Username already taken");
        err.status = 400;
        throw err;
    }


    const updatedUser = await model.Tailor.findByIdAndUpdate(userId,
        {
            username
        },
        {
            new: true, runValidators: true
        }
    ).select("fullName username");

    if (!updatedUser) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }

    return updatedUser;
};