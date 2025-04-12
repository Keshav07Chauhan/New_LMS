import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    subjectCreation,
    addStudentsToSubject,
    getSubjectsByUserId,
    deleteSubject,
    deleteStudentFromSubject,
  } from '../controllers/subject.controller.js';

const router = Router()


router.use(verifyJWT);

// Create a subject
router.route("/create-subject").post(subjectCreation)

// Add students to a subject
router.route("/add-students/:subjectId").post(addStudentsToSubject);

// Get subjects for logged-in user
router.route("/my-subjects").get(getSubjectsByUserId);

// Delete a subject
router.route("/delete-subject/:subjectId").delete(deleteSubject);

// Delete a student from a subject
router.route("/delete-student/:subjectId").delete(deleteStudentFromSubject);


export default router;