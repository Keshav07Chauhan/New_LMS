import mongoose from "mongoose";
import { stringify } from "querystring";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    postId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,       //cloudinary url
        default: null
    },
    coverImagePublicId: {
        type: String,
        default: null
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export const Post = mongoose.model("Post", postSchema)