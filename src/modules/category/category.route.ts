import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { categoryController } from "./category.controller";
import { categoryValidation } from "./category.validation";


const categoryRouter = Router();
categoryRouter.get("/", categoryController.getAllCategories);

const adminCategoryRouter = Router();
adminCategoryRouter.get(
  "/",
  auth(Role.ADMIN),
  categoryController.getAllCategories,
);
adminCategoryRouter.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(categoryValidation.createSchema),
  categoryController.createCategory,
);
adminCategoryRouter.put(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(categoryValidation.updateSchema),
  categoryController.updateCategory,
);
adminCategoryRouter.delete(
  "/:id",
  auth(Role.ADMIN),
  categoryController.deleteCategory,
);

export const categoryRoutes = {
  categoryRouter,
  adminCategoryRouter,
};
