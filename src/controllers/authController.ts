import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import type { AuthRequest } from "../middleware/authMiddleware";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../utils/sendEmail";
import { normalizeEmail } from "../utils/auth";
import { generateAuthResponse } from "../utils/auth";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;

    const normalizedEmail =
      typeof email === "string" ? normalizeEmail(email) : email;

    if (!fullName || !normalizedEmail || !password) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.isVerified) {
        res.status(400).json({
          message: "User already exists",
        });
        return;
      }

      await User.deleteOne({ _id: existingUser._id });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpires,
    });

    // await sendEmail(
    //   normalizedEmail,
    //   "Verify Your Account Creation",
    //   `Hello ${fullName},<br><br>Your 6-digit registration confirmation passcode is:<br><b style="font-size: 24px; letter-spacing: 2px; color: #1e3a8a;">${otp}</b><br><br>This token will expire in 5 minutes.`,
    // );

    res.status(200).json({
      message:
        "Registration pending. A 6-digit code has been dispatched to your email inbox.",
    });
  },
);

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const normalizedEmail =
    typeof email === "string" ? normalizeEmail(email) : email;

  if (!normalizedEmail || !otp) {
    res.status(400).json({
      message: "Email and confirmation code are required fields.",
    });
    return;
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    res.status(404).json({
      message: "User not found.",
    });
    return;
  }

  if (user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
    res.status(400).json({
      message: "Invalid or expired verification code.",
    });
    return;
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;

  user.set("createdAt", undefined);

  await user.save();

  res.status(200).json({
    message: "Account successfully verified! You are now logged in.",
    ...generateAuthResponse(user),
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const normalizedEmail =
    typeof email === "string" ? normalizeEmail(email) : email;

  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.password) {
    res.status(400).json({
      message: "Invalid credentials",
    });
    return;
  }

  if (!user.isVerified) {
    res.status(400).json({
      message: "Email is not verified. Register again.",
    });
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    res.status(400).json({
      message: "Invalid credentials",
    });
    return;
  }

  res.status(200).json({
    message: "Login successful",
    ...generateAuthResponse(user),
  });
});

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  res.status(200).json(req.user);
};

export const googleLogin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google token");
    }

    const { email, sub: googleId, name } = payload;

    const normalizedEmail =
      typeof email === "string" ? normalizeEmail(email) : email;

    if (!normalizedEmail) {
      throw new Error("Invalid Google token");
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        fullName: name,
        email: normalizedEmail,
        googleId,
        authProvider: "google",
      });
    }

    res.status(201).json({
      message: "User registered successfully",
      ...generateAuthResponse(user),
    });
  },
);
