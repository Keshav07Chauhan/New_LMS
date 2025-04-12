import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    resource:{
        type: String,       //cloudinary url
        required: true
    },
    resourcePublicId: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
},{timestamps:true})

export const Resource = mongoose.model("Resource", resourceSchema)