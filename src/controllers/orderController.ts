import type { Response } from "express";
import type { Types } from "mongoose";
import type { AuthRequest } from "../middleware/authMiddleware";
import { Food } from "../models/Food";
import Order from "../models/Order";
import User from "../models/User";

type OrderRequestBody = {
  contact?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  fulfillment?: "delivery" | "pickup";
  deliveryAddress?: {
    address?: string;
    city?: string;
    zipCode?: string;
  };
  paymentMethod?: "card" | "counter";
};

type CartFood = {
  _id: Types.ObjectId;
  title: string;
  price: number;
  image: string;
};

type PopulatedCartItem = {
  food: CartFood;
  quantity: number;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const {
      contact,
      fulfillment = "delivery",
      deliveryAddress,
      paymentMethod = "card",
    } = req.body as OrderRequestBody;

    if (!contact?.fullName || !contact.email || !contact.phone) {
      return res.status(400).json({
        message: "Full name, email and phone are required.",
      });
    }

    if (!["delivery", "pickup"].includes(fulfillment)) {
      return res.status(400).json({ message: "Invalid fulfillment method." });
    }

    if (!["card", "counter"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    if (
      fulfillment === "delivery" &&
      (!deliveryAddress?.address ||
        !deliveryAddress.city ||
        !deliveryAddress.zipCode)
    ) {
      return res.status(400).json({
        message: "Delivery address, city and ZIP code are required.",
      });
    }

    const user = await User.findById(req.user._id).populate<{
      cart: PopulatedCartItem[];
    }>({
      path: "cart.food",
      model: Food,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const items = user.cart.map((item) => ({
      food: item.food._id,
      title: item.food.title,
      price: item.food.price,
      image: item.food.image,
      quantity: item.quantity,
    }));

    const subtotal = roundCurrency(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    );
    const serviceFee = subtotal > 0 ? 4.99 : 0;
    const deliveryFee = fulfillment === "delivery" && subtotal > 0 ? 6.5 : 0;
    const tax = roundCurrency(subtotal * 0.05);
    const total = roundCurrency(subtotal + serviceFee + deliveryFee + tax);

    const order = await Order.create({
      user: user._id,
      items,
      contact,
      fulfillment,
      deliveryAddress:
        fulfillment === "delivery" ? deliveryAddress : undefined,
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

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
      cart: [],
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "Order could not be created." });
  }
};
