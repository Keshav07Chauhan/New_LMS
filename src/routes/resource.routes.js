import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createResource,
    getResourcesBySubject,
    updateResource,
    deleteResource
} from "../controllers/resource.controller.js";

const router = Router()

router.use(verifyJWT);

// Get resources by subject
router.route("/subject").post(getResourcesBySubject);

// Create a new resource (Teacher/Admin)
router.route("/").post(
    upload.fields([
        { name: "resource", maxCount: 1 }
    ]),
    createResource
);

// Update a resource (Teacher/Admin)
router.route("/:resourceId").patch(
    upload.fields([
        { name: "resource", maxCount: 1 }
    ]),
    updateResource
);

// Delete a resource (Teacher/Admin)
router.route("/:resourceId").delete(deleteResource);


export default router;