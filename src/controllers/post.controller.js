import mongoose from "mongoose"
import {Post} from "../models/post.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getAllPost = asyncHandler(async (req,res) => {
    //TODO: getting all Post
})


const addPost = asyncHandler(async (req, res) => {
    // TODO: add a Post
    const user = req.user;
    if(user.role===('admin' || 'teacher')){
        
    }
})

const updatePost = asyncHandler(async (req, res) => {
    // TODO: update a Post
})

const deletePost = asyncHandler(async (req, res) => {
    // TODO: delete a Post
})


export {
    addPost,
    updatePost,
    deletePost
}