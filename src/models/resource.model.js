import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    path:{
        type: String,       //cloudinary url
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    }
},{timestamps:true})

export const Resource = mongoose.model("Resource", resourceSchema)