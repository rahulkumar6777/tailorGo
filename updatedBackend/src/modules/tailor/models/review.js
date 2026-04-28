import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tailor',
    required: true
  },
  reviewerName: {
    type: String,
    required: true
  },
  comment: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Review = mongoose.model("Review", reviewSchema);