import express from "express";
import {
  addCartItem,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "../controllers/cartController";
import protect from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getCartItems);
router.post("/", protect, addCartItem);
router.patch("/:foodId", protect, updateCartItemQuantity);
router.delete("/:foodId", protect, removeCartItem);

export default router;
