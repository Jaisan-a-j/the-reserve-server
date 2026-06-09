export const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
