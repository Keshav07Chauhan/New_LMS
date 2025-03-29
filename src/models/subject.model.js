import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    student: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    teacher: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})

export const Subject = mongoose.model("Subject", subjectSchema)