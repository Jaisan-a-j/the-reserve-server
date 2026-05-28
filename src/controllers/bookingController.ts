import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import Booking from "../models/Booking";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, date, time, message } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!phone || !date || !time) {
      return res
        .status(400)
        .json({ message: "Phone, date and time are required" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      phone,
      date,
      time,
      message,
      status: "pending",
    });

    return res.status(201).json({ booking });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "Booking could not be created" });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const bookings = await Booking.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "Could not fetch bookings" });
  }
};

export const getBookedTimeSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const bookings = await Booking.find({
      date: date as string,
      status: { $in: ["confirmed", "pending"] },
    }).select("time");

    const bookedTimeSlots = bookings.map((booking) => booking.time);

    return res.status(200).json({ bookedTimeSlots });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "Could not fetch booked slots" });
  }
};
