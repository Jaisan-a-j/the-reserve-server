import mongoose, { Schema, Document } from "mongoose";

export interface UserOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    food: mongoose.Types.ObjectId;
    title: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  contact: {
    fullName: string;
    email: string;
    phone: string;
  };
  fulfillment: "delivery" | "pickup";
  deliveryAddress?: {
    address: string;
    city: string;
    zipCode: string;
  };
  paymentMethod: "card" | "counter";
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: "pending" | "confirmed" | "cancelled";
}

const orderSchema = new Schema<UserOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        food: {
          type: Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        image: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    contact: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    fulfillment: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    deliveryAddress: {
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      zipCode: {
        type: String,
      },
    },
    paymentMethod: {
      type: String,
      enum: ["card", "counter"],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceFee: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<UserOrder>("Order", orderSchema);
