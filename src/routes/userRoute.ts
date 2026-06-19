import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  googleLogin,
  verifyOtp,
  updateUserProfile,
} from "../controllers/authController";

import protect from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/user", protect, getCurrentUser);
router.put("/profile", protect, updateUserProfile);
router.post("/google", googleLogin);
router.post("/verifyotp", verifyOtp);

export default router;
