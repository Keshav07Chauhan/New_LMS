import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Subject } from '../models/subject.model.js';
import { User } from '../models/user.model.js';


const subjectCreation = asyncHandler(async(req,res)=>{

    const {subjectId, subjectName, subjectTeacher} = req.body;

    if(
        [subjectId, subjectName, subjectTeacher].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existSubject = await Subject.findOne({subjectId});

    if(existSubject){
        throw new ApiError(409, "Subject with subjectId already exists")
    }

    const teacher = await User.findOne({userId: subjectTeacher});

    const subject = await Subject.create({
        subjectId,
        subjectName,
        subjectTeacher: teacher?._id,
    })

    if(!subject){
        throw new ApiError(500, "Something went wrong while creating a subject")
    }
    await User.updateOne(
        {userId: subjectTeacher},
        {$addToSet: { subject: subject?._id }}
    )

    return res.status(201).json(
            new ApiResponse(200, subject, "Subject Created Successfully")
        )
})


const addStudentsToSubject = asyncHandler(async(req,res)=>{

    const {subjectId} = req.params;
    const {studentIds} = req.body;

    if (!studentIds || studentIds.length === 0) {
        throw new ApiError(400, "No student Ids provided");
    }

    const subject = await Subject.findOne({subjectId});
    if (!subject) {
        throw new ApiError(404, "Subject does not exist")
    }

    const validStudents = await User.find({ 
        userId: { $in: studentIds },
        role: 'student' 
    });

    if(validStudents.length === 0){
        throw new ApiError(401, "Student ids are not valid");
    }

    subject.subjectStudent = [...new Set([...subject.subjectStudent,
                                          ...validStudents.map(student=>student?._id)])];
    await subject.save();

    await User.updateMany(
        {userId: {$in: validStudents.map(student => student.userId)}},
        {$addToSet: { subject: subject?._id }}
    )

    return res.status(201).json(
        new ApiResponse(200, subject, "Students Added Successfully")
    )
})

const getSubjectsByUserId = asyncHandler(async(req,res)=>{

    const user = req.user;

    const subjects = await Subject.find({
        _id: {$in : user.subject}
    })
    
    return res.status(201).json(
        new ApiResponse(200, subjects, "Subjects are fetched Successfully")
    )
})

const deleteSubject = asyncHandler(async(req,res)=>{
    const {subjectId} = req.params;

    const subjectExist = await Subject.findById(subjectId);
    if(!subjectExist){
        throw new ApiError(404, "Subject does not exist")
    }

    await User.updateMany(
        { subject: subjectId },
        { $pull: { subject: subjectId } }
    );

    await Subject.findByIdAndDelete(subjectId);

    return res.status(201).json(
        new ApiResponse(200, {}, "Subject is deleted Successfully")
    )
})

const deleteStudentFromSubject = asyncHandler(async(req,res)=>{
    const {subjectId} = req.params;
    const userId = req.body;

    const subjectExist = await Subject.findById(subjectId);
    if(!subjectExist){
        throw new ApiError(404, "Subject does not exist")
    }

    const userExist = await User.findById(userId);
    if(!userExist){
        throw new ApiError(404, "User does not exist")
    }

    subjectExist.subjectStudent = subjectExist.subjectStudent.filter(id => id.toString() !== userId);
    await subjectExist.save();

    await User.updateOne(
        { userId: userId },
        { $pull: { subject: subjectId } }
    );

    return res.status(201).json(
        new ApiResponse(200, {}, "Student from subject is deleted Successfully")
    )
})

export{
    subjectCreation,
    addStudentsToSubject,
    getSubjectsByUserId,
    deleteSubject,
    deleteStudentFromSubject,
    
}