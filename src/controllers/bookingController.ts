import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import Booking from "../models/Booking";
import { sendEmail } from "../utils/sendEmail";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, date, time, message } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { email, fullName } = req.user;

    if (!phone || !date || !time) {
      return res
        .status(400)
        .json({ message: "Phone, date and time are required" });
    }

    const userBookings = await Booking.find({
      user: req.user._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (userBookings.length >= 2) {
      return res.status(400).json({
        message: "You can only book two slots total.",
        bookings: userBookings,
      });
    }

    const sameDateBooking = userBookings.find(
      (booking) => booking.date === date,
    );

    if (sameDateBooking) {
      return res.status(400).json({
        message:
          "You already have a booking for this date. Please choose another day.",
        booking: sameDateBooking,
      });
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

    const bookings = await Booking.find({
      user: req.user._id,
      status: { $in: ["pending", "confirmed"] },
    }).sort({
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

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      booking,
      message: "Booking cancelled successfully.",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "Could not cancel booking" });
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
