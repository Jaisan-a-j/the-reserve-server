import express from "express";
import { createReview } from "../controllers/reviewController";
import protect from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createReview);

export default router;
