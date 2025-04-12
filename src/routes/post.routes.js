import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addPost,
    updatePost,
    deletePost,
    getAllPost
  } from "../controllers/post.controller.js";


const router = Router()

router.use(verifyJWT);

// Get all posts
router.route("/").get(getAllPost);

// Add a new post (Admin or Teacher only)
router.route("/add-post").post(
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
  addPost
);

// Update a post (Author or Admin)
router.route("/update-post").patch(
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
  updatePost
);

// Delete a post (Admin or Author)
router.route("/:postId").delete(deletePost);


export default router;