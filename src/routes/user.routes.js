import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getUserChannelProfile } from "../controllers/user.controller.js";
import {askAI} from "../controllers/aiDoubtSolver.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),                             //upload used here is a middleware that says to meet me before going to the registerUser and that will help in uploading files to the cloudinary.
    registerUser
)


router.route("/login").post(loginUser)


//ask AI routes
router.route("/ask-ai").post(askAI);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/c/:userId").get(verifyJWT, getUserChannelProfile)   //when params is used then have to send data from parameter


export default router;