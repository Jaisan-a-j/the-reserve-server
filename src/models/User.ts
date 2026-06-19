import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  googleId: string;
  authProvider: string;
  isVerified: boolean;
  otp: string | null;
  otpExpires: Date | null;
  profile: {
    address: string;
    city: string;
    pinCode: string;
  };
  cart: {
    food: mongoose.Types.ObjectId;
    quantity: number;
  }[];
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      required: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    profile: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },
    cart: [
      {
        food: {
          type: Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>("User", userSchema);
