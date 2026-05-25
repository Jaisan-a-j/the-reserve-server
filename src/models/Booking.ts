import mongoose, { Schema, Document } from "mongoose";

export interface UserBooking extends Document {
  user: mongoose.Types.ObjectId;
  phone: string;
  date: string;
  time: string;
  message?: string;
  status: "pending" | "confirmed" | "cancelled";
}

const bookingSchema = new Schema<UserBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<UserBooking>("Booking", bookingSchema);
