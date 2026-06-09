import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Food } from "../models/Food";

export const createFoodItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, price, category, dietary, spice, image } =
      req.body;

    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !dietary ||
      !spice ||
      !image
    ) {
      res.status(400).json({
        success: false,
        message:
          "All fields are required! Please check title, description, price, category, dietary, spice, and image.",
      });
      return;
    }

    if (!Array.isArray(dietary)) {
      res.status(400).json({
        success: false,
        message:
          "The 'dietary' field must be an array of strings (e.g., ['Vegan', 'Vegetarian']).",
      });
      return;
    }

    const newFoodItem = new Food({
      title,
      description,
      price,
      category,
      dietary,
      spice,
      image,
    });

    await newFoodItem.save();

    res.status(201).json({
      success: true,
      message: "🎉 New food item added to the menu successfully!",
      data: newFoodItem,
    });
  },
);

export const getFoodItems = asyncHandler(
  async (_req: Request, res: Response) => {
    const foodItems = await Food.find().sort({ _id: -1 });

    res.status(200).json({
      success: true,
      data: foodItems,
    });
  },
);
