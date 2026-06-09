import { type OrderRequestBody } from "../types/foodTypes";

export const validateOrderRequest = (body: OrderRequestBody) => {
  const {
    contact,
    fulfillment = "delivery",
    deliveryAddress,
    paymentMethod = "card",
  } = body;

  if (!contact?.fullName || !contact.email || !contact.phone) {
    return { status: 400, message: "Full name, email and phone are required." };
  }

  if (!["delivery", "pickup"].includes(fulfillment)) {
    return { status: 400, message: "Invalid fulfillment method." };
  }

  if (!["card", "counter"].includes(paymentMethod)) {
    return { status: 400, message: "Invalid payment method." };
  }

  if (
    fulfillment === "delivery" &&
    (!deliveryAddress?.address ||
      !deliveryAddress.city ||
      !deliveryAddress.zipCode)
  ) {
    return {
      status: 400,
      message: "Delivery address, city and ZIP code are required.",
    };
  }

  return null;
};
