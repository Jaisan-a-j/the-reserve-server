import express from "express";
import { createFoodItem, getFoodItems } from "../controllers/foodController";

const router = express.Router();

router.get("/", getFoodItems);
router.post("/add-food-item", createFoodItem);

export default router;
