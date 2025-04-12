import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true 
    },
    options: [
        {
            optionText: String,
            _id: false // optional, removes automatic _id for subdocs
        }
    ],
    correctOption: {
        type: Number, // index of correct option in the array
        required: true
    },
    explanation: String,
    marks: {
        type: Number,
        default: 1
    }
});

export const Question = mongoose.model("Question", questionSchema);
