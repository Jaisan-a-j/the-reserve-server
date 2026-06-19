import type { Response } from "express";
import asyncHandler from "express-async-handler";
import type { AuthRequest } from "../middleware/authMiddleware";
import Booking from "../models/Booking";
import { sendEmail } from "../utils/sendEmail";
import { requireUser } from "../utils/auth";

export const createBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { phone, date, time, message } = req.body;

    requireUser(req, res);

    const { email, fullName } = req.user;

    if (!phone || !date || !time) {
      res.status(400).json({ message: "Phone, date and time are required" });
      return;
    }

    const userBookings = await Booking.find({
      user: req.user._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (userBookings.length >= 2) {
      res.status(400).json({
        message: "You can only book two slots total.",
        bookings: userBookings,
      });
      return;
    }

    const sameDateBooking = userBookings.find(
      (booking) => booking.date === date,
    );

    if (sameDateBooking) {
      res.status(400).json({
        message:
          "You already have a booking for this date. Please choose another day.",
        booking: sameDateBooking,
      });
      return;
    }

    const booking = await Booking.create({
      user: req.user._id,
      phone,
      date,
      time,
      message,
      status: "pending",
    });

    await sendEmail(
      email,
      "Table Booking Confirmation",
      `Hello ${fullName},<br><br> Your booking at The Reserve is confirmed for ${date} at ${time}. Thank you!`,
    );

    res.status(201).json({ booking });
  },
);

export const getMyBookings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    requireUser(req, res);
    const bookings = await Booking.find({
      user: req.user._id,
      status: { $in: ["pending", "confirmed"] },
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({ bookings });
  },
);

export const cancelBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    requireUser(req, res);
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      booking,
      message: "Booking cancelled successfully.",
    });
  },
);

export const getBookedTimeSlots = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ message: "Date is required" });
      return;
    }

    const bookings = await Booking.find({
      date: date as string,
      status: { $in: ["confirmed", "pending"] },
    }).select("time");

    const bookedTimeSlots = bookings.map((booking) => booking.time);

    res.status(200).json({ bookedTimeSlots });
  },
);
