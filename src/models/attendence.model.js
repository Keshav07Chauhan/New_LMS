import mongoose from "mongoose";

const attendenceSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: date,
        required: true
    }
})

export const Attendence = mongoose.model("Attendence", attendenceSchema)