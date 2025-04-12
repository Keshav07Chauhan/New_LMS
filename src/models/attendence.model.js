import mongoose from "mongoose";

const attendenceSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    }, 
    date: {
        type: Date,
        required: true
    },
    students: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            status: {
                type: String,
                enum: ['present','absent'],
                default: 'absent'
            }
        }
    ]
})

export const Attendence = mongoose.model("Attendence", attendenceSchema)