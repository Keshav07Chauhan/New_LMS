import { Post } from "../models/post.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';


const getAllPost = asyncHandler(async (req, res) => {
    //TODO: getting all Post
    const posts = await Post.find().sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
        throw new ApiError(404, "No posts available")
    }

    return res.status(201).json(
        new ApiResponse(200, posts, "Posts fetched Successfully")
    )
})


const addPost = asyncHandler(async (req, res) => {
    // TODO: add a Post
    const user = req.user;
    if (user.role === 'admin' || user.role === 'teacher') {
        const { title, postId, content } = req.body;

        if ([title, postId, content].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required")
        }

        const existPost = await Post.findOne({postId});
        if (existPost) {
            throw new ApiError(409, "Post is already Existed")
        }

        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        const createdPost = await Post.create({
            title,
            postId,
            content,
            coverImage: coverImage?.secure_url || null,
            coverImagePublicId: coverImage?.public_id || null,
            author: user._id
        })

        return res.status(201).json(
            new ApiResponse(200, createdPost, "Post created Successfully")
        )
    }
    else {
        throw new ApiError(401, "User is Unauthorized")
    }
})

const updatePost = asyncHandler(async (req, res) => {
    // TODO: update a Post
    const { postId, title, content } = req.body;
    const post = await Post.findOne({ postId });

    if (!post) {
        throw new ApiError(400, "Post not found")
    }

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let coverImage;

    if (req.user?.role === 'admin' || post.author.toString() === req.user?._id.toString()) {

        if (coverImageLocalPath) {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
            if (!(coverImage.secure_url || coverImage.public_id)) {
                throw new ApiError(400, "Error while uploading on coverImage")
            }
            if (post?.coverImagePublicId) {
                const isCoverImageDeleted = await deleteFromCloudinary(post?.coverImagePublicId)
                if (!isCoverImageDeleted) {
                    throw new ApiError(400, "Error while deleting coverImage")
                }
            }
        }


        const updateFields = {
            ...(title && { title }),
            ...(content && { content }),
            ...(coverImage?.secure_url && { coverImage: coverImage.secure_url }),
            ...(coverImage?.public_id && { coverImagePublicId: coverImage.public_id })
        };

        const updatedPost = await Post.findByIdAndUpdate(
            post._id,
            {
                $set: {
                    ...updateFields
                }
            },
            { new: true }
        )
        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedPost, "cover Image updated successfully")
            )
    }
})

const deletePost = asyncHandler(async (req, res) => {
    // TODO: delete a Post
    const {postId} = req.params;

    const postExist = await Post.findOne({postId});
    if(!postExist){
        throw new ApiError(404, "Post does not exist")
    }

    await Post.findByIdAndDelete(postExist?._id);

    return res.status(201).json(
        new ApiResponse(200, {}, "Post is deleted Successfully")
    )
})


export {
    addPost,
    updatePost,
    deletePost,
    getAllPost
}