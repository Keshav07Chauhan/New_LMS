import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Subject } from '../models/subject.model.js';
import { User } from '../models/user.model.js';
import { Attendence } from '../models/attendence.model.js';


// const markAttendence = asyncHandler(async (req, res) => {

// })

const getAttendenceByStudent = asyncHandler(async (req, res) => {

    const studentId = req.user?._id;
    const { subjectId } = req.body;

    if (!subjectId) {
        throw new ApiError(400, "SubjectId is required");
    }
    const subject = await Subject.findOne({subjectId});

    const attendenceRecords = await Attendence.find({
        subject: subject?._id,
        "students.student": studentId
    })
        .populate("subject", "subjectId subjectName")
        .sort({ date: 1 });

    if (!attendenceRecords.length) {
        throw new ApiError(404, "No attendance records found for this student");
    }

    const studentAttendence = attendenceRecords.map((record) => {
        const studentEntry = record.students.find(
            (s) => s.student.toString() === studentId
        );

        return {
            date: record.date,
            subject: record.subject,
            status: studentEntry?.status || "absent"
        };
    });

    return res.status(200).json(
        new ApiResponse(200, studentAttendence, "Attendence fetched successfully")
    );
});


// const updateAttendence = asyncHandler(async (req, res) => {

// })

const deleteAttendence = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const { subjectId, date } = req.body;

    if (role != 'teacher' && role != 'admin') {
        throw new ApiError(403, "Unauthorized Access");
    }

    if (!subjectId || !date) {
        throw new ApiError(400, "SubjectId and Date are required");
    }
    const subject = await Subject.findOne({subjectId});
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const deletedAttendence = await Attendence.findOneAndDelete({
        subject: subject?._id,
        date: targetDate
    });

    if (!deletedAttendence) {
        throw new ApiError(404, "No attendence record found for the given subject and date");
    }

    return res.status(200).json(
        new ApiResponse(200,{}, "Attendence deleted successfully")
    );
});


//bulkMarkAttendence is used for both creation as well as updation purpose
const bulkMarkAttendence = asyncHandler(async (req, res) => {
    const { subjectId, date, students } = req.body;

    if (!subjectId || !date || !Array.isArray(students)) {
        throw new ApiError(400, "SubjectId, date and students data is required");
    }

    const subject = await Subject.findOne({subjectId});
    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }
    const student_ids = (
        await Promise.all(
          students.map(async (s) => {
            const temp = await User.findOne({userId: s});
            return temp?._id || null;
          })
        )
      ).filter((id) => id !== null);
    const registeredStudentIds = subject.subjectStudent.filter(id => id !== null).map(id => id.toString());
    const presentStudentIds = student_ids.map(s => s.toString());
    const presentRegisteredStudentIds = presentStudentIds.filter(id => registeredStudentIds.includes(id));

    const studentEntries = registeredStudentIds.map(id => ({
        student: id,
        status: presentRegisteredStudentIds.includes(id) ? 'present' : 'absent'
    }));

    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0); // Normalize the time

    let attendence = await Attendence.findOne({ subject: subject?._id, date: formattedDate });

    if (attendence) {
        attendence.students = studentEntries;
        await attendence.save();
    } else {
        attendence = await Attendence.create({
            subject: subject?._id,
            date: formattedDate,
            students: studentEntries
        });
    }

    return res.status(201).json(
        new ApiResponse(200, attendence, "Attendence for specific date is Created Successfully")
    )
})

const getAttendenceSummaryToStudent = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { subjectId } = req.body;

    if (req.user.role === 'student') {

        if (!subjectId) {
            throw new ApiError(400, "SubjectId is required");
        }

        const subject = await Subject.findOne({subjectId});

        const attendenceRecords = await Attendence.find({
            subject: subject?._id,
            "students.student": userId
        });

        let totalClasses = attendenceRecords.length;
        let presentCount = 0;

        attendenceRecords.forEach(record => {
            const entry = record.students.find(s => s.student.toString() === userId);
            if (entry?.status === "present") presentCount++;
        });

        const absentCount = totalClasses - presentCount;
        const attendencePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

        const summary = {
            subject: subjectId,
            student: userId,
            totalClasses,
            presentCount,
            absentCount,
            attendencePercentage: `${attendencePercentage}%`
        };

        return res.status(200).json(
            new ApiResponse(200, summary, "Attendance summary fetched successfully")
        );
    }
    else {
        throw new ApiError(403, "Unauthorized access");
    }
});

const getAttendenceSummaryToTeacher = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const { subjectId, studentId } = req.body;

    if (role === 'teacher') {
        if (!subjectId || !studentId) {
            throw new ApiError(400, "SubjectId and StudentId are required");
        }
        const subject = await Subject.findOne({subjectId});
        const student = await User.findOne({userId: studentId});
        const attendenceRecords = await Attendence.find({
            subject: subject?._id,
            "students.student": student?._id
        });

        let totalClasses = attendenceRecords.length;
        let presentCount = 0;

        attendenceRecords.forEach(record => {
            const entry = record.students.find(s => s.student.toString() === student?._id);
            if (entry?.status === "present") presentCount++;
        });

        const absentCount = totalClasses - presentCount;
        const attendencePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

        const summary = {
            subject: subject?._id,
            student: student?._id,
            totalClasses,
            presentCount,
            absentCount,
            attendencePercentage: `${attendencePercentage}%`
        };

        return res.status(200).json(
            new ApiResponse(200, summary, "Attendence summary fetched successfully")
        );
    } else {
        throw new ApiError(403, "Unauthorized access");
    }
});

const getAttendenceByDate = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const { subjectId, date } = req.body;
    if (role === 'admin' || role === 'teacher') {

        if (!subjectId || !date) {
            throw new ApiError(400, "Subject ID and Date are required");
        }
        const subject = await Subject.findOne({subjectId});
        const targetDate = new Date(date);
        const nextDate = new Date(targetDate);
        nextDate.setDate(targetDate.getDate() + 1);

        const attendence = await Attendence.findOne({
            subject: subject?._id,
            date: {
                $gte: targetDate,     // 2025-04-04T00:00:00.000Z
                $lt: nextDate        // 2025-04-05T00:00:00.000Z
            }
        })

        if (!attendence) {
            throw new ApiError(404, "No attendance record found for the given subject and date");
        }

        return res.status(200).json(
            new ApiResponse(200, attendence, "Attendance fetched successfully")
        )
    }
    else {
        throw new ApiError(403, "Unauthorized access");
    }
})



export {
    getAttendenceByDate,
    getAttendenceByStudent,
    getAttendenceSummaryToStudent,
    getAttendenceSummaryToTeacher,
    deleteAttendence,
    bulkMarkAttendence,
}