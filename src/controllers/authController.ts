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
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
    });

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
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({
        message: "Something went wrong",
      });
    }
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
