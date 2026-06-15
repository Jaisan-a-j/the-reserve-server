import type { Response } from "express";
import asyncHandler from "express-async-handler";
import type { AuthRequest } from "../middleware/authMiddleware";
import Review from "../models/Review";

export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?._id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { rating, comment } = req.body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
      return;
    }

    if (!comment || !String(comment).trim()) {
      res.status(400).json({ message: "Comment is required" });
      return;
    }

    const review = await Review.create({
      userId: req.user._id,
      userName: req.user.fullName,
      rating,
      comment: String(comment).trim(),
    });

    res.status(201).json({ review });
  },
);

export const getReviews = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ reviews });
  },
);
