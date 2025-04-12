import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Question } from '../models/question.model.js';

const createQuestion = asyncHandler(async (req, res) => {
    const { questionText, options, correctOption, explanation, marks } = req.body;
    const role = req.user.role;

    if (role != 'teacher') {
        throw new ApiError(403, "Unauthorized Access");
    }

    // Validate required fields
    if (!questionText || !Array.isArray(options) || options.length < 2) {
        throw new ApiError(400, "Question text and at least two options are required");
    }

    if (correctOption === undefined || correctOption < 0 || correctOption >= options.length) {
        throw new ApiError(400, "Correct option index is invalid");
    }

    const newQuestion = await Question.create({
        questionText,
        options,
        correctOption,
        explanation,
        marks,
    });

    if (!newQuestion) {
        throw new ApiError(500, "Something went wrong while creating questions")
    }

    return res.status(201).json(
        new ApiResponse(201, newQuestion, "Question created successfully")
    );
})

const updateQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const { questionText, options, correctOption, explanation, marks } = req.body;
    const role = req.user.role;

    if (role != 'teacher') {
        throw new ApiError(403, "Unauthorized Access");
    }

    if (!questionId) {
        throw new ApiError(400, "QuestionId is required");
    }

    const question = await Question.findById(questionId);

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    // Validate if options are being updated
    if (options && (!Array.isArray(options) || options.length < 2)) {
        throw new ApiError(400, "At least two options are required");
    }

    // Validate correctOption if it's being updated
    if (
        correctOption !== undefined &&
        (!options && correctOption >= question.options.length) || // no new options
        (options && correctOption >= options.length)
    ) {
        throw new ApiError(400, "Correct option index is invalid");
    }

    // Update fields conditionally
    if (questionText) question.questionText = questionText;
    if (options) question.options = options;
    if (correctOption !== undefined) question.correctOption = correctOption;
    if (explanation !== undefined) question.explanation = explanation;
    if (marks !== undefined) question.marks = marks;

    const updatedQuestion = await question.save();

    return res.status(200).json(
        new ApiResponse(200, updatedQuestion, "Question updated successfully")
    );
})

const deleteQuestion = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const { questionId } = req.params;

    if (role != 'teacher') {
        throw new ApiError(403, "Unauthorized Access");
    }

    if (!questionId) {
        throw new ApiError(400, "Question ID is required");
    }

    const question = await Question.findById(questionId);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
        throw new ApiError(400, "Error whule deleting question")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Question deleted successfully")
    );
})

const createBulkQuestions = asyncHandler(async (req, res) => {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(400, "Questions data must be a non-empty array");
    }

    // Validate each question before inserting
    const validatedQuestions = questions.map((q, index) => {
        if (!q.questionText || !Array.isArray(q.options) || q.correctOption == null || q.options.length < 2) {
            throw new ApiError(400, `Invalid question format at index ${index}`);
        }

        return {
            questionText: q.questionText,
            options: q.options.map(opt => ({ optionText: opt })),
            correctOption: q.correctOption,
            explanation: q.explanation || "",
            marks: q.marks || 1
        };
    });

    const insertedQuestions = await Question.insertMany(validatedQuestions);

    return res.status(201).json(
        new ApiResponse(201, insertedQuestions, "Questions imported successfully")
    );
});

export {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createBulkQuestions,

}