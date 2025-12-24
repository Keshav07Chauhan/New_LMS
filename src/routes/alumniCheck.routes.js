import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getApprovalRequestList,approveAlumni,getApprovedAlumniList } from "../controllers/user.controller.js";

const router = Router()

router.use(verifyJWT);

//this api will send the all the alumni whose approval = 1
router.route("/getApprovalRequestList").get(getApprovalRequestList)
//this api will send the all the alumni whose approval = 2
router.route("/getApprovedAlumniList").get(getApprovedAlumniList)
//this api will approve i.e approval = 2 or reject i.e approval=0 and save it to the database.
router.route("/approveAlumni").patch(approveAlumni)

export default router;