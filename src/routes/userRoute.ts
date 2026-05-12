import express from "express";
import User from "../models/User";

const router = express.Router();

router.post("/users", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const newUser = await User.create({
      fullName,
      email,
      password,
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
