import express from "express";
import { chatWithAi } from "../controllers/chatController";

const router = express.Router();

router.post("/", chatWithAi);

export default router;
