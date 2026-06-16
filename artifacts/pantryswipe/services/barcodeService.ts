export interface BarcodeProduct {
  id?: number;
  barcode: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  source: "db" | "openfoodfacts" | "upcitemdb";
}

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
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
