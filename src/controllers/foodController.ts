import { Request, Response } from "express";
import { Food } from "../models/Food";

export const createFoodItem = async (req: Request, res: Response) => {
  try {
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
      return res.status(400).json({
        success: false,
        message:
          "All fields are required! Please check title, description, price, category, dietary, spice, and image.",
      });
    }

    if (!Array.isArray(dietary)) {
      return res.status(400).json({
        success: false,
        message:
          "The 'dietary' field must be an array of strings (e.g., ['Vegan', 'Vegetarian']).",
      });
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

    return res.status(201).json({
      success: true,
      message: "🎉 New food item added to the menu successfully!",
      data: newFoodItem,
    });
  } catch (error) {
    console.error("❌ Error adding menu item:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while saving the menu item.",
    });
  }
};

export const getFoodItems = async (_req: Request, res: Response) => {
  try {
    const foodItems = await Food.find().sort({ _id: -1 });

    return res.status(200).json({
      success: true,
      data: foodItems,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching menu items.",
    });
  }
};
