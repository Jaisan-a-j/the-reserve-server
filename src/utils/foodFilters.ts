import type { Request } from "express";

const parseArrayParam = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseNumberParam = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const getArrayParam = (
  query: Request["query"],
  key: string,
): string[] => {
  const direct = parseArrayParam(query[key]);
  if (direct.length > 0) return direct;

  return parseArrayParam(query[`${key}[]`]);
};

export const buildFoodFilter = (query: Request["query"]) => {
  const filter: Record<string, unknown> = {};

  const minPrice = parseNumberParam(query.minPrice);
  const maxPrice = parseNumberParam(query.maxPrice);

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) priceFilter.$gte = minPrice;
    if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
    filter.price = priceFilter;
  }

  const cuisines = getArrayParam(query, "cuisines");
  if (cuisines.length > 0) {
    filter.category = { $in: cuisines };
  }

  const dietary = getArrayParam(query, "dietary");
  if (dietary.length > 0) {
    filter.dietary = { $all: dietary };
  }

  const spice = getArrayParam(query, "spice");
  if (spice.length > 0) {
    filter.spice = { $in: spice };
  }

  return filter;
};
