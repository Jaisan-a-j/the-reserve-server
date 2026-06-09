import { roundCurrency } from "./order";

type OrderItem = {
  price: number;
  quantity: number;
};

export const calculateOrderPricing = (
  items: OrderItem[],
  fulfillment: string,
) => {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const serviceFee = subtotal > 0 ? 4.99 : 0;
  const deliveryFee = fulfillment === "delivery" && subtotal > 0 ? 6.5 : 0;
  const tax = roundCurrency(subtotal * 0.05);
  const total = roundCurrency(subtotal + serviceFee + deliveryFee + tax);

  return {
    subtotal,
    serviceFee,
    deliveryFee,
    tax,
    total,
  };
};
