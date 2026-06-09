import type { Types } from "mongoose";
import { formatCurrency } from "./order";

type OrderEmailPayload = {
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
};

export const buildOrderEmail = (order: OrderEmailPayload) => {
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
