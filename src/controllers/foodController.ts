import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Food } from "../models/Food";
import Order from "../models/Order";
import { buildFoodFilter } from "../utils/foodFilters";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

const getTwoDaysAgo = () => new Date(Date.now() - TWO_DAYS_MS);

const lookupFoodItems = [
  {
    $lookup: {
      from: "foods",
      localField: "_id",
      foreignField: "_id",
      as: "food",
    },
  },
  { $unwind: "$food" },
  { $replaceRoot: { newRoot: "$food" } },
];

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

export const getFoodItems = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const hasPagination = !Number.isNaN(page) && !Number.isNaN(limit);
  const filter = buildFoodFilter(req.query);

  if (hasPagination) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      Food.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Food.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    });
    return;
  }

  const foodItems = await Food.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: foodItems,
  });
});

export const getFoodPriceRange = asyncHandler(
  async (_req: Request, res: Response) => {
    const [result] = await Food.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        minPrice: result?.minPrice ?? 0,
        maxPrice: result?.maxPrice ?? 100,
      },
    });
  },
);

export const getBestSellers = asyncHandler(
  async (_req: Request, res: Response) => {
    const bestSellers = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.food",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      ...lookupFoodItems,
    ]);

    res.status(200).json({
      success: true,
      data: bestSellers,
    });
  },
);

export const getChefSpecials = asyncHandler(
  async (_req: Request, res: Response) => {
    const chefSpecials = await Food.find({ chefSpecial: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: chefSpecials,
    });
  },
);

export const getNewArrivals = asyncHandler(
  async (_req: Request, res: Response) => {
    const twoDaysAgo = getTwoDaysAgo();
    const newArrivals = await Food.find({
      createdAt: { $gte: twoDaysAgo },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: newArrivals,
    });
  },
);

export const getTrending = asyncHandler(async (_req: Request, res: Response) => {
  const twoDaysAgo = getTwoDaysAgo();
  const trending = await Order.aggregate([
    {
      $match: {
        status: { $ne: "cancelled" },
        createdAt: { $gte: twoDaysAgo },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.food",
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalQuantity: -1 } },
    ...lookupFoodItems,
  ]);

  res.status(200).json({
    success: true,
    data: trending,
  });
});
