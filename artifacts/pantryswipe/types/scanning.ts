export interface DetectedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
  emoji: string;
  estimatedPrice?: number;
}

export type ScanSource = "fridge-scan" | "receipt-scan" | "manual";

export const CATEGORY_EMOJIS: Record<string, string> = {
  dairy: "🥛",
  produce: "🥦",
  meat: "🥩",
  seafood: "🐟",
  frozen: "❄️",
  grains: "🌾",
  condiments: "🧂",
  sauces: "🫙",
  spices: "🌶️",
  drinks: "🍷",
  snacks: "🍫",
  baking: "🥄",
  other: "📦",
};

export const SCAN_UNITS = ["pieces", "g", "kg", "ml", "L", "pack", "bunch", "bottle", "can", "bag"] as const;

export const SCAN_CATEGORIES = [
  { key: "dairy", label: "Dairy", emoji: "🥛" },
  { key: "produce", label: "Produce", emoji: "🥦" },
  { key: "meat", label: "Meat", emoji: "🥩" },
  { key: "seafood", label: "Seafood", emoji: "🐟" },
  { key: "frozen", label: "Frozen", emoji: "❄️" },
  { key: "grains", label: "Grains", emoji: "🌾" },
  { key: "condiments", label: "Condiments", emoji: "🧂" },
  { key: "sauces", label: "Sauces", emoji: "🫙" },
  { key: "spices", label: "Spices", emoji: "🌶️" },
  { key: "drinks", label: "Drinks", emoji: "🍷" },
  { key: "snacks", label: "Snacks", emoji: "🍫" },
  { key: "baking", label: "Baking", emoji: "🥄" },
  { key: "other", label: "Other", emoji: "📦" },
];

export const SCAN_LOCATIONS = [
  { key: "fridge", label: "Fridge" },
  { key: "freezer", label: "Freezer" },
  { key: "pantry", label: "Pantry" },
  { key: "spice-rack", label: "Spice Rack" },
];
