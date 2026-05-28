import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookedTimeSlots,
} from "../controllers/bookingController";
import protect from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/me", protect, getMyBookings);
router.get("/available-slots", getBookedTimeSlots);

export default router;
