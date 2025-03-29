import mongoose from "mongoose";

const marksSchema = new mongoose.Schema({
    testName: {
        type: String,
        required: true
    },
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
    marks: {
        type: Number,
        required: true
    }
})

export const Marks = mongoose.model("Marks", marksSchema)