import mongoose from "mongoose";

interface Food extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  category: string;
  dietary: string[];
  spice: string;
  image: string;
  chefSpecial: boolean;
}

const FoodSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  dietary: { type: [String], required: true },
  spice: { type: String, required: true },
  image: { type: String, required: true },
  chefSpecial: { type: Boolean, default: false }
});

export const Food = mongoose.model<Food>("Food", FoodSchema);
