import express from "express";
import { createBooking, getMyBookings } from "../controllers/bookingController";
import protect from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/me", protect, getMyBookings);

export default router;
