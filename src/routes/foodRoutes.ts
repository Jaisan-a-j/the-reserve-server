import express from "express";
import {
  createFoodItem,
  getBestSellers,
  getFoodItems,
} from "../controllers/foodController";

const router = express.Router();

router.get("/", getFoodItems);
router.get("/best-sellers", getBestSellers);
router.post("/add-food-item", createFoodItem);

export default router;
