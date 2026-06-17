import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";

export interface RecipeMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
  inPantry: boolean;
}

export interface RecipeStep {
  step_number: number;
  instruction: string;
  timer_seconds: number | null;
}

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine"),
  source: text("source").default("ai_generated"),
  source_id: text("source_id").unique(),
  image_url: text("image_url"),
  difficulty: text("difficulty").default("Medium"),
  cook_time_mins: integer("cook_time_mins").default(30),
  servings: integer("servings").default(2),
  calories: integer("calories"),
  macros_json: jsonb("macros_json").$type<RecipeMacros>(),
  ingredients_json: jsonb("ingredients_json").$type<RecipeIngredient[]>(),
  steps_json: jsonb("steps_json").$type<RecipeStep[]>(),
  tags: text("tags").array(),
  event_types: text("event_types").array(),
  dietary_flags: text("dietary_flags").array(),
  allergens: text("allergens").array(),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("4.2"),
  ai_generated: boolean("ai_generated").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export type DbRecipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
