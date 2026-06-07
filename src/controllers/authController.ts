import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import type { AuthRequest } from "../middleware/authMiddleware";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../utils/sendEmail";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : email;

    if (!fullName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          message: "User already exists",
        });
      } else {
        await User.deleteOne({ _id: existingUser._id });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // await sendEmail(
    //   normalizedEmail,
    //   "Verify Your Account Creation",
    //   `Hello ${fullName},<br><br>Your 6-digit registration confirmation passcode is:<br><b style="font-size: 24px; letter-spacing: 2px; color: #1e3a8a;">${otp}</b><br><br>This token will expire in 5 minutes.`,
    // );

    // await sendEmail({
    //   to: ["user1@gmail.com", "user2@gmail.com"],
    //   subject: "Welcome",
    //   htmlContent: "<h1>Hello</h1>",
    // });
    try {
      console.log("API KEY EXISTS:", !!process.env.MAILJET_API_KEY);
      console.log("SECRET KEY EXISTS:", !!process.env.MAILJET_SECRET_KEY);

      await sendEmail();

      res.json({ success: true });
    } catch (error: any) {
      console.error("FULL ERROR:");
      console.error(error);

      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    }

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpires,
    });

    return res.status(200).json({
      message:
        "Registration pending. A 6-digit code has been dispatched to your email inbox.",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : email;

    if (!normalizedEmail || !otp) {
      return res
        .status(400)
        .json({ message: "Email and confirmation code are required fields." });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    user.set("createdAt", undefined);
    await user.save();

    return res.status(200).json({
      message: "Account successfully verified! You are now logged in.",
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server verification error." });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : email;

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "email is not verified Register again.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  res.status(200).json(req.user);
};

export const googleLogin = async (req: any, res: any) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        message: "Invalid Google token",
      });
    }

    const { email, sub: googleId, name, picture } = payload;
    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : email;

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Invalid Google token" });
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
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Google login failed" });
  }
};
