import type { Response } from "express";
import type { Types } from "mongoose";
import type { AuthRequest } from "../middleware/authMiddleware";
import { Food } from "../models/Food";
import Order from "../models/Order";
import User from "../models/User";
import { sendEmail } from "../utils/sendEmail";

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

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const buildOrderEmail = (order: {
  _id: Types.ObjectId;
  items: { title: string; price: number; quantity: number }[];
  contact: { fullName: string };
  fulfillment: "delivery" | "pickup";
  paymentMethod: "card" | "counter";
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  tax: number;
  total: number;
}) => {
  const eta = order.fulfillment === "delivery" ? "35-45 min" : "20-25 min";
  const orderId = order._id.toString().slice(-6).toUpperCase();
  const itemRows = order.items
    .map(
      (item) =>
        `${item.title} x ${item.quantity} - ${formatCurrency(
          item.price * item.quantity,
        )}`,
    )
    .join("<br>");

  return `
    Hello ${order.contact.fullName},<br><br>
    Thank you for ordering from The Reserve. Your order has been received.<br><br>
    <strong>Order ID:</strong> ${orderId}<br>
    <strong>Method:</strong> ${order.fulfillment}<br>
    <strong>Payment:</strong> ${
      order.paymentMethod === "card" ? "Card" : "Pay at counter"
    }<br>
    <strong>Estimated time:</strong> ${eta}<br><br>
    <strong>Items</strong><br>
    ${itemRows}<br><br>
    <strong>Subtotal:</strong> ${formatCurrency(order.subtotal)}<br>
    <strong>Service fee:</strong> ${formatCurrency(order.serviceFee)}<br>
    <strong>Delivery fee:</strong> ${formatCurrency(order.deliveryFee)}<br>
    <strong>Tax:</strong> ${formatCurrency(order.tax)}<br>
    <strong>Total:</strong> ${formatCurrency(order.total)}<br><br>
    We will notify you if anything changes.
  `;
};

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

    let emailSent = false;
    let emailMessage: string | undefined;

    try {
      await sendEmail(
        contact.email,
        "The Reserve Order Confirmation",
        buildOrderEmail(order),
      );
      emailSent = true;
    } catch (emailError) {
      emailMessage =
        emailError instanceof Error
          ? emailError.message
          : "Order confirmation email could not be sent.";
      console.error("Order email failed:", emailMessage);
    }

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
      cart: [],
      email: {
        sent: emailSent,
        message: emailSent ? "Confirmation email sent." : emailMessage,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "Order could not be created." });
  }
};
