import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subjectId: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    subjectTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subjectStudent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})

export const Subject = mongoose.model("Subject", subjectSchema)