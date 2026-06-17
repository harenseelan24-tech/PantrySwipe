import { Router, type IRouter, type Request, type Response } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const VARIATION_PROMPTS: Record<string, string> = {
  "Make Vegetarian":
    "Transform this recipe to be 100% vegetarian. Replace all meat, poultry, and seafood with plant-based alternatives (e.g. replace chicken with tofu or chickpeas, ground beef with lentils or mushrooms, fish with jackfruit or tempeh). Keep the flavour profile and cooking method as similar as possible. Add a brief note explaining the key substitutions.",
  "Budget Version":
    "Make this recipe as budget-friendly as possible. Replace expensive ingredients with cheaper alternatives (e.g. replace salmon with tinned tuna or sardines, expensive cuts with cheaper ones, specialty produce with regular alternatives). Aim to halve the estimated cost. Add a note on the approximate saving.",
  "High Protein":
    "Optimise this recipe for maximum protein. Increase the protein-rich ingredients (meat, eggs, beans, tofu, dairy) and reduce carbs and fats where possible. Target at least 40g protein per serving. Add a note on the new protein count.",
  "Spicier":
    "Crank up the heat on this recipe. Add chillies (fresh or dried), chilli flakes, sriracha, cayenne, or other heat sources. Adjust the amounts so the dish is noticeably spicy but still enjoyable. Add a note on the heat level (1-10 scale).",
  "Make Halal":
    "Adapt this recipe to be fully Halal-compliant. Replace all pork products (bacon, ham, lard, pancetta) with Halal beef or chicken alternatives. Replace any alcohol-based ingredients (wine, beer, spirits) with alternatives like grape juice, stock, or broth. Add a note confirming the changes.",
  "Faster Version":
    "Optimise this recipe to be ready in under 20 minutes total (prep + cook). Simplify steps, use shortcuts (pre-cut veg, tinned ingredients, microwave steps), and reduce cooking time without sacrificing too much flavour. Add a note on the new estimated time.",
};

interface IngredientIn { name: string; amount: string; inPantry: boolean }
interface StepIn { step: number; instruction: string; timerMinutes?: number }

router.post("/recipes/vary", async (req: Request, res: Response) => {
  const { variation, recipe } = req.body as {
    variation: string;
    recipe: { title: string; servings: number; ingredients: IngredientIn[]; steps: StepIn[] };
  };

  if (!variation || !recipe) {
    res.status(400).json({ error: "variation and recipe are required" });
    return;
  }

  const instructions = VARIATION_PROMPTS[variation];
  if (!instructions) {
    res.status(400).json({ error: `Unknown variation: ${variation}` });
    return;
  }

  const prompt = `You are a professional recipe developer. Here is a recipe:

Title: ${recipe.title}
Servings: ${recipe.servings}

Ingredients:
${recipe.ingredients.map((i) => `- ${i.name}: ${i.amount}`).join("\n")}

Steps:
${recipe.steps.map((s) => `${s.step}. ${s.instruction}${s.timerMinutes ? ` [${s.timerMinutes} min timer]` : ""}`).join("\n")}

Task: ${instructions}

Return ONLY valid JSON (no markdown, no prose outside the JSON) in this exact shape:
{
  "ingredients": [
    { "name": "...", "amount": "...", "inPantry": false }
  ],
  "steps": [
    { "step": 1, "instruction": "...", "timerMinutes": null }
  ],
  "notes": "One-sentence summary of what changed."
}

Rules:
- Keep the same number of steps or fewer.
- timerMinutes must be a number or null (not omitted).
- Preserve the JSON field names exactly.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    // Strip potential markdown code fences
    const cleaned = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    logger.error({ err }, "recipe vary error");
    res.status(500).json({ error: "Failed to generate variation" });
  }
});

export default router;
