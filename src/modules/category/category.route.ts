import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { categoryController } from "./category.controller";
import { categoryValidation } from "./category.validation";

// Public — GET /api/categories
const publicRouter = Router();
publicRouter.get("/", categoryController.getAllCategories);

// Admin — /api/admin/categories
const adminRouter = Router();
adminRouter.get("/", auth(Role.ADMIN), categoryController.getAllCategories);
adminRouter.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(categoryValidation.createSchema),
  categoryController.createCategory,
);
adminRouter.put(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(categoryValidation.updateSchema),
  categoryController.updateCategory,
);
adminRouter.delete("/:id", auth(Role.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = { publicRouter, adminRouter };
