import { Response } from "express";
import User from "../models/User";
import { Food } from "../models/Food";
import type { AuthRequest } from "../middleware/authMiddleware";

const getPopulatedCart = async (userId: string) => {
  const user = await User.findById(userId)
    .select("cart")
    .populate("cart.food");

  return user?.cart ?? [];
};

export const getCartItems = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching cart items.",
    });
  }
};

export const addCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food id is required.",
      });
    }

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const requestedQuantity = Math.max(1, Number(quantity));
    const cartItem = user.cart.find(
      (item) => item.food.toString() === foodId,
    );

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

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding cart item.",
    });
  }
};

export const updateCartItemQuantity = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { foodId } = req.params;
    const { quantity } = req.body;

    if (!foodId || !quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Food id and quantity greater than zero are required.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const cartItem = user.cart.find(
      (item) => item.food.toString() === foodId,
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    cartItem.quantity = Number(quantity);
    await user.save();

    const cart = await getPopulatedCart(user._id.toString());

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating cart item.",
    });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { foodId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.cart = user.cart.filter((item) => item.food.toString() !== foodId);
    await user.save();

    const cart = await getPopulatedCart(user._id.toString());

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while removing cart item.",
    });
  }
};
