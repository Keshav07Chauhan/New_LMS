import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
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
    path:{
        type: String,       //cloudinary url
        required: true
    }
},{timestamps:true})

export const Assignment = mongoose.model("Assignment", assignmentSchema)