import { pgTable, serial, text, real, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const pantryItemsTable = pgTable("pantry_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("default"),
  productId: integer("product_id").references(() => productsTable.id),
  quantity: real("quantity").notNull().default(1),
  expiryDate: date("expiry_date", { mode: "string" }),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPantryItemSchema = createInsertSchema(pantryItemsTable).omit({
  id: true,
  addedAt: true,
});
export type InsertPantryItem = z.infer<typeof insertPantryItemSchema>;
export type PantryItemRecord = typeof pantryItemsTable.$inferSelect;
