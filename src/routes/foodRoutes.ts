import express from "express";
import {
  createFoodItem,
  getBestSellers,
  getChefSpecials,
  getFoodItems,
  getNewArrivals,
  getTrending,
} from "../controllers/foodController";

const router = express.Router();

router.get("/", getFoodItems);
router.get("/best-sellers", getBestSellers);
router.get("/chef-specials", getChefSpecials);
router.get("/new-arrivals", getNewArrivals);
router.get("/trending", getTrending);
router.post("/add-food-item", createFoodItem);

export default router;
