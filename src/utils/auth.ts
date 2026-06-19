import generateToken from "./generateToken";
import { AuthRequest } from "../middleware/authMiddleware";
import type { Response } from "express";

export const normalizeEmail = (email: string) => email.toLowerCase().trim();

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const getOtpExpiry = () => new Date(Date.now() + 5 * 60 * 1000);

export const formatUserResponse = (user: {
  _id?: { toString: () => string };
  id?: string;
  fullName: string;
  email: string;
  profile?: {
    address?: string;
    city?: string;
    pinCode?: string;
  };
}) => ({
  _id: user._id?.toString() ?? user.id ?? "",
  fullName: user.fullName,
  email: user.email,
  profile: {
    address: user.profile?.address ?? "",
    city: user.profile?.city ?? "",
    pinCode: user.profile?.pinCode ?? "",
  },
});

export const generateAuthResponse = (user: {
  _id: { toString: () => string };
  fullName: string;
  email: string;
  profile?: {
    address?: string;
    city?: string;
    pinCode?: string;
  };
}) => ({
  token: generateToken(user._id.toString()),
  user: formatUserResponse(user),
});

export const requireUser = (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Not authorized" });
  }
};
