import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    //check if user already exit
    // check for images, check for avatar
    // upload to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { fullName, userId, email, password, role} = req.body
    // console.log("email: ",email);

    // if(fullname === ""){
    //     throw new ApiError(400, "fullname is required")
    // }
    if (
        [fullName, userId, email, password, role].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existUser = await User.findOne({
        $or: [{ userId }, { email }]       //$ is used before operators and the first user with username or email that matches this one will be answer.
    })

    if (existUser) {
        throw new ApiError(409, "User with email or userId already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        userId,
        avatar: avatar.url,
        // coverImage: coverImage?.url || "",
        role,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"               //.select is taking a string that contains the fields with - sign to not give the fileds.
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    //req.body -> data
    //username or email
    //find the user
    //password check
    //access and refresh token generate
    // send cookie

    const { email, userId, password } = req.body

    if (!(userId || email)) {
        throw new ApiError(400, "userId or email is required")
    }

    const user = await User.findOne({
        $or: [{ userId }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")//in this step, either re-query the database or update the object "user" that is defined above the accessToken is provided.

    const options = {
        httpOnly: true,     //by default cookies can be modified by anyone. so, httpOnly and secure ko true kiya hai taaki modification server side se hi ho paye
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken   //it is for: if user wants to save the accessToken and refreshToken for his purpose like in localStorage or he develop the mobile app(where the cookies are not set)
            }, "User logged In Successfully")
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    //Since, we not not access the user from req. So, auth.middleware.js is created in order to verify the user that append the user into the req and we can access it here in order to verify before logout that it is the same user.
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1   //this removes the field from document
            }
        },
        {
            new: true               //jo value return hogi woh new value ho old nahi.
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", accessToken, options)
        .clearCookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})


// the very imp., refreshing the access token that will help in access the ones profile securely.
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid user")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})


const changeCurrentPassword = asyncHandler(async (req,res)=>{

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"current user fetched successfully"))
})



const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    //TODO-left: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )
})



const getUserChannelProfile = asyncHandler(async (req,res)=>{
    
    const  {username} = req.params
    
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    // User.find({username})
    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"

            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "channel does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"User channel fetched successfully"))

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    getUserChannelProfile
}