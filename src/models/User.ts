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
  },
  {
    timestamps: true,
  },
);

userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model<IUser>("User", userSchema);
