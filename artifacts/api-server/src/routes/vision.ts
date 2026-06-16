import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface VisionItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
  emoji?: string;
  estimated_price?: number;
}

const ITEM_EMOJIS: Record<string, string> = {
  dairy: "🥛", produce: "🥦", meat: "🥩", seafood: "🐟",
  frozen: "❄️", grains: "🌾", condiments: "🧂", sauces: "🫙",
  spices: "🌶️", drinks: "🍷", snacks: "🍫", baking: "🥄", other: "📦",
};

function assignEmoji(category: string): string {
  return ITEM_EMOJIS[category?.toLowerCase()] ?? "🍽️";
}

async function callClaude(prompt: string, imageBase64: string): Promise<VisionItem[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
        },
        { type: "text", text: prompt },
      ],
    }],
  });

  const text = message.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return [];

  const raw = text.text.trim();
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const parsed = JSON.parse(jsonMatch[0]) as VisionItem[];
  return Array.isArray(parsed) ? parsed : [];
}

router.post("/vision/scan-pantry", async (req, res) => {
  const { image } = req.body as { image?: string };
  if (!image) {
    res.status(400).json({ error: "image is required" });
    return;
  }

  const base64 = image.replace(/^data:image\/[a-z]+;base64,/, "");

  const prompt = `You are a pantry inventory AI. Identify every visible food item in this image.
Return ONLY a valid JSON array, no other text. Each object must have:
- name (string, clean common name)
- quantity (number, estimate 1 if unclear)
- unit (string: one of pieces/g/kg/ml/L/pack/bunch/bottle/can/bag)
- category (string: one of dairy/produce/meat/seafood/frozen/grains/condiments/sauces/spices/drinks/snacks/baking/other)
- location (string: one of fridge/freezer/pantry/spice-rack)
If no food items are visible, return [].`;

  try {
    const items = await callClaude(prompt, base64);
    const result = items.map((item) => ({
      ...item,
      emoji: assignEmoji(item.category),
    }));
    res.json({ items: result });
  } catch (err) {
    logger.error({ err }, "scan-pantry vision error");
    res.json({ items: [] });
  }
});

router.post("/vision/scan-receipt", async (req, res) => {
  const { image } = req.body as { image?: string };
  if (!image) {
    res.status(400).json({ error: "image is required" });
    return;
  }

  const base64 = image.replace(/^data:image\/[a-z]+;base64,/, "");

  const prompt = `You are a grocery receipt parser. Read this receipt image carefully.
Extract every food and grocery item. Ignore non-food items (bags, batteries, cleaning products).
Return ONLY a valid JSON array, no other text. Each object must have:
- name (string, clean readable product name — not the barcode or SKU)
- quantity (number — if receipt shows "2x Milk" use 2, else default to 1)
- unit (string: pieces/g/kg/ml/L/pack/can/bottle/bag — infer from product type)
- category (string: dairy/produce/meat/seafood/frozen/grains/condiments/sauces/spices/drinks/snacks/baking/other)
- location (string: one of fridge/freezer/pantry/spice-rack — infer from product)
- estimated_price (number, the price shown next to the item, or null if not visible)
If the image is not a receipt or no items are readable, return [].`;

  try {
    const items = await callClaude(prompt, base64);
    const result = items.map((item) => ({
      ...item,
      emoji: assignEmoji(item.category),
    }));
    res.json({ items: result });
  } catch (err) {
    logger.error({ err }, "scan-receipt vision error");
    res.json({ items: [] });
  }
});

router.post("/pantry/bulk-add", (req, res) => {
  const { items } = req.body as { items?: VisionItem[] };
  if (!Array.isArray(items)) {
    res.status(400).json({ error: "items array is required" });
    return;
  }
  res.json({ success: true, count: items.length });
});

export default router;
