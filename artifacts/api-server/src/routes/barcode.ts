import { Router, type IRouter, type Request, type Response } from "express";
import { db, productsTable, insertProductSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { barcodeLimiter } from "../middleware/rateLimiters";
import { BarcodeParamSchema } from "../lib/schemas";

const router: IRouter = Router();

interface ExternalProduct {
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
}

async function queryOpenFoodFacts(barcode: string): Promise<ExternalProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status: number;
      product?: {
        product_name?: string;
        brands?: string;
        categories?: string;
        image_url?: string;
        image_front_url?: string;
      };
    };
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const name = p.product_name?.trim();
    if (!name) return null;
    return {
      name,
      brand: p.brands?.split(",")[0]?.trim() || undefined,
      category: p.categories?.split(",")[0]?.trim() || undefined,
      imageUrl: p.image_front_url || p.image_url || undefined,
    };
  } catch {
    return null;
  }
}

async function queryUpcItemDb(barcode: string): Promise<ExternalProduct | null> {
  const apiKey = process.env["UPCITEMDB_API_KEY"];
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
      {
        headers: { "user_key": apiKey, "key_type": "3scale" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      code?: string;
      items?: Array<{
        title?: string;
        brand?: string;
        category?: string;
        images?: string[];
      }>;
    };
    if (data.code !== "OK" || !data.items?.length) return null;
    const item = data.items[0];
    if (!item?.title) return null;
    return {
      name: item.title,
      brand: item.brand || undefined,
      category: item.category || undefined,
      imageUrl: item.images?.[0] || undefined,
    };
  } catch {
    return null;
  }
}

router.get("/barcode/:barcode", barcodeLimiter, async (req: Request, res: Response) => {
  const paramResult = BarcodeParamSchema.safeParse(req.params);
  if (!paramResult.success) {
    res.status(400).json({ error: "Invalid barcode — must be 8–14 digits" });
    return;
  }

  const { barcode } = paramResult.data;

  // 1. Internal database lookup
  const [existing] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.barcode, barcode))
    .limit(1);

  if (existing) {
    res.json({
      found: true,
      source: "db",
      product: {
        id: existing.id,
        barcode: existing.barcode,
        name: existing.name,
        brand: existing.brand,
        category: existing.category,
        imageUrl: existing.imageUrl,
        source: "db",
      },
    });
    return;
  }

  // 2. Open Food Facts (no key required)
  const offProduct = await queryOpenFoodFacts(barcode);
  if (offProduct) {
    const parsed = insertProductSchema.safeParse({
      barcode,
      name: offProduct.name,
      brand: offProduct.brand ?? null,
      category: offProduct.category ?? null,
      imageUrl: offProduct.imageUrl ?? null,
    });
    let savedId: number | undefined;
    if (parsed.success) {
      try {
        const [saved] = await db
          .insert(productsTable)
          .values(parsed.data)
          .returning({ id: productsTable.id });
        savedId = saved?.id;
      } catch {
        // race condition — another request may have inserted first; ignore
      }
    }
    res.json({
      found: true,
      source: "openfoodfacts",
      product: {
        id: savedId,
        barcode,
        name: offProduct.name,
        brand: offProduct.brand ?? null,
        category: offProduct.category ?? null,
        imageUrl: offProduct.imageUrl ?? null,
        source: "openfoodfacts",
      },
    });
    return;
  }

  // 3. UPCitemDB (optional paid key)
  const upcProduct = await queryUpcItemDb(barcode);
  if (upcProduct) {
    const parsed = insertProductSchema.safeParse({
      barcode,
      name: upcProduct.name,
      brand: upcProduct.brand ?? null,
      category: upcProduct.category ?? null,
      imageUrl: upcProduct.imageUrl ?? null,
    });
    let savedId: number | undefined;
    if (parsed.success) {
      try {
        const [saved] = await db
          .insert(productsTable)
          .values(parsed.data)
          .returning({ id: productsTable.id });
        savedId = saved?.id;
      } catch {
        // ignore duplicate
      }
    }
    res.json({
      found: true,
      source: "upcitemdb",
      product: {
        id: savedId,
        barcode,
        name: upcProduct.name,
        brand: upcProduct.brand ?? null,
        category: upcProduct.category ?? null,
        imageUrl: upcProduct.imageUrl ?? null,
        source: "upcitemdb",
      },
    });
    return;
  }

  // 4. Not found anywhere
  res.json({ found: false, source: null, product: null });
});

export default router;
