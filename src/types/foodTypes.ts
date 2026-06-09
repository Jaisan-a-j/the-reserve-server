import type { Types } from "mongoose";

export type OrderRequestBody = {
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

export type CartFood = {
  _id: Types.ObjectId;
  title: string;
  price: number;
  image: string;
};
