import { Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import { Food } from "../models/Food";
import type { AuthRequest } from "../middleware/authMiddleware";

const getPopulatedCart = async (userId: string) => {
  const user = await User.findById(userId).select("cart").populate("cart.food");

  return user?.cart ?? [];
};

export const getCartItems = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const cart = await getPopulatedCart(req.user._id);

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const addCartItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { foodId, quantity = 1 } = req.body;

    if (!foodId) {
      res.status(400).json({
        success: false,
        message: "Food id is required.",
      });
      return;
    }

    const food = await Food.findById(foodId);

    if (!food) {
      res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    const requestedQuantity = Math.max(1, Number(quantity));
    const cartItem = user.cart.find((item) => item.food.toString() === foodId);

    if (cartItem) {
      cartItem.quantity += requestedQuantity;
    } else {
      user.cart.push({
        food: food._id,
        quantity: requestedQuantity,
      });
    }

    await user.save();

    const cart = await getPopulatedCart(user._id.toString());

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const updateCartItemQuantity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { foodId } = req.params;
    const { quantity } = req.body;

    if (!foodId || !quantity || Number(quantity) < 1) {
      res.status(400).json({
        success: false,
        message: "Food id and quantity greater than zero are required.",
      });
      return;
    }

    const food = await Food.findById(foodId);

    if (!food) {
      res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    const cartItem = user.cart.find((item) => item.food.toString() === foodId);

    if (cartItem) {
      cartItem.quantity = Number(quantity);
    } else {
      user.cart.push({
        food: food._id,
        quantity: Number(quantity),
      });
    }

    await user.save();

    const cart = await getPopulatedCart(user._id.toString());

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const removeCartItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { foodId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    user.cart = user.cart.filter((item) => item.food.toString() !== foodId);
    await user.save();

    const cart = await getPopulatedCart(user._id.toString());

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);
