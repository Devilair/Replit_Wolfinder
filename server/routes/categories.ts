import type { Express, Request, Response } from "express";
import { z } from "zod";
import type { AppStorage } from "../storage";
import { NewCategory } from "@wolfinder/shared";

const createCategorySchema = z.object({
  name: z.string().min(3, "Il nome deve essere di almeno 3 caratteri"),
  description: z.string().optional(),
});

export function setupCategoryRoutes(app: Express, storage: AppStorage) {
  // GET all categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // POST a new category
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const validation = createCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ message: "Dati non validi", errors: validation.error.format() });
      }

      const newCategory: NewCategory = validation.data;
      const createdCategory = await storage.createCategory(newCategory);
      
      res.status(201).json(createdCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
} 