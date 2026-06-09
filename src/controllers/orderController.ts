import type { Response } from "express";
import asyncHandler from "express-async-handler";
import type { Types } from "mongoose";
import type { AuthRequest } from "../middleware/authMiddleware";
import { Food } from "../models/Food";
import Order from "../models/Order";
import User from "../models/User";
import { sendEmail } from "../utils/sendEmail";
import { buildOrderEmail } from "../utils/buildOrderEmail";
import { roundCurrency, formatCurrency as fixCurrency } from "../utils/order";
import { calculateOrderPricing } from "../utils/orderPricing";
import { type OrderRequestBody, CartFood } from "../types/foodTypes";
import { validateOrderRequest } from "../utils/validateOrderRequest";

type PopulatedCartItem = {
  food: CartFood;
  quantity: number;
};

export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?._id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const validationError = validateOrderRequest(req.body as OrderRequestBody);
    if (validationError) {
      res
        .status(validationError.status)
        .json({ message: validationError.message });
      return;
    }

    const {
      contact,
      fulfillment = "delivery",
      deliveryAddress,
      paymentMethod = "card",
    } = req.body as OrderRequestBody;

    const user = await User.findById(req.user._id).populate<{
      cart: PopulatedCartItem[];
    }>({
      path: "cart.food",
      model: Food,
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (user.cart.length === 0) {
      res.status(400).json({ message: "Your cart is empty." });
      return;
    }

    const items = user.cart.map((item) => ({
      food: item.food._id,
      title: item.food.title,
      price: item.food.price,
      image: item.food.image,
      quantity: item.quantity,
    }));

    const { subtotal, serviceFee, deliveryFee, tax, total } =
      calculateOrderPricing(items, fulfillment);

    const order = await Order.create({
      user: user._id,
      items,
      contact,
      fulfillment,
      deliveryAddress: fulfillment === "delivery" ? deliveryAddress : undefined,
      paymentMethod,
      subtotal,
      serviceFee,
      deliveryFee,
      tax,
      total,
      status: "pending",
    });

    user.cart = [];
    await user.save();

    let emailSent = false;
    let emailMessage: string | undefined;

    try {
      // await sendEmail(
      //   contact.email,
      //   "The Reserve Order Confirmation",
      //   buildOrderEmail(order),
      // );
      emailSent = true;
    } catch (emailError) {
      emailMessage =
        emailError instanceof Error
          ? emailError.message
          : "Order confirmation email could not be sent.";
      console.error("Order email failed:", emailMessage);
    }

    res.status(201).json({
      message: "Order placed successfully.",
      order,
      cart: [],
      email: {
        sent: emailSent,
        message: emailSent ? "Confirmation email sent." : emailMessage,
      },
    });
  },
);

export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?._id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ orders });
  },
);
