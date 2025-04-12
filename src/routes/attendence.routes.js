import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getAttendenceByDate,
    getAttendenceByStudent,
    getAttendenceSummaryToStudent,
    getAttendenceSummaryToTeacher,
    deleteAttendence,
    bulkMarkAttendence,
  } from "../controllers/attendence.controller.js";

const router = Router()

router.use(verifyJWT);

// Bulk mark or update attendance (Teacher/Admin)
router.route("/mark-attendence").post(bulkMarkAttendence);

// Get attendance for logged-in student
router.route("/get-student-attendence").post(getAttendenceByStudent);

// Get attendance summary for logged-in student
router.route("/attendence-summary-to-student").post(getAttendenceSummaryToStudent);

// Get attendance summary for a specific student (Teacher only)
router.route("/attendence-summary-to-teacher").post(getAttendenceSummaryToTeacher);

// Get attendance for a subject by date (Teacher/Admin)
router.route("/attendence-by-date").post(getAttendenceByDate);

// Delete attendance for a specific subject & date (Teacher/Admin)
router.route("/delete-attendence").delete(deleteAttendence);


export default router;