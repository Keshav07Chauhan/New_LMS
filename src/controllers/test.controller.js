import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Test } from "../models/test.model.js";
import { Subject } from "../models/subject.model.js";
import { Question } from "../models/question.model.js";

const createTest = asyncHandler(async (req, res) => {

    const { title, description, subjectId, questions, startTime, endTime } = req.body;
    const userId = req.user._id;

    const role = req.user.role;

    if (role != 'teacher') {
        throw new ApiError(403, "Unauthorized Access");
    }

    if (!title || !subjectId || !Array.isArray(questions) || !startTime || !endTime) {
        throw new ApiError(400, "Title, subjectId, questions, startTime, and endTime are required");
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    // Check if all question IDs are valid
    const validQuestions = await Question.find({ _id: { $in: questions } });
    if (validQuestions.length !== questions.length) {
        throw new ApiError(400, "Some question IDs are invalid");
    }

    const newTest = await Test.create({
        title,
        description: description || "",
        subject: subjectId,
        questions,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        createdBy: userId
    });

    return res.status(201).json(
        new ApiResponse(201, newTest, "Test created successfully")
    );
});

const updateTest = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { title, description, startTime, endTime, questions } = req.body;

    const test = await Test.findById(testId);
    if (!test) throw new ApiError(404, "Test not found");

    if (questions) {
        const validQuestions = await Question.find({ _id: { $in: questions } });
        if (validQuestions.length !== questions.length) {
            throw new ApiError(400, "Some question IDs are invalid");
        }
    }

    test.title = title ?? test.title;
    test.description = description ?? test.description;
    test.startTime = startTime ?? test.startTime;
    test.endTime = endTime ?? test.endTime;
    if (questions) test.questions = questions;

    await test.save();
    res.status(200).json(new ApiResponse(200, test, "Test updated successfully"));
});

const deleteTest = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const test = await Test.findById(testId);
    if (!test) throw new ApiError(404, "Test not found");

    const deletedTest = await Test.findByIdAndDelete(testId);

    if (!deletedTest) {
        throw new ApiError(400, "error while deleting test");
    }
    res.status(200).json(new ApiResponse(200, {}, "Test deleted successfully"));
});

const getTestById = asyncHandler(async (req, res) => {
    const { testId } = req.params;
  
    const test = await Test.findById(testId)
      .populate("subject", "subjectName")
      .populate("questions");
  
    if (!test) throw new ApiError(404, "Test not found");
  
    res.status(200).json(new ApiResponse(200, test, "Test fetched successfully"));
  });

export {
    createTest,
    updateTest,
    deleteTest,
    getTestById,
    
}