import { Platform } from "react-native";

export interface BarcodeProduct {
  id?: number;
  barcode: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  source: "db" | "openfoodfacts" | "upcitemdb";
}

const API_BASE = Platform.OS !== "web"
  ? `https://${process.env.EXPO_PUBLIC_API_DOMAIN ?? "zip-repl-cactusussy24.replit.app"}`
  : "";

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/api/barcode/${encodeURIComponent(barcode)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      found: boolean;
      product: BarcodeProduct | null;
    };
    if (!data.found || !data.product) return null;
    return data.product;
  } catch {
    return null;
  }
}
