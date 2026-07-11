import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./category.interface";

const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return categories;
};

const createCategoryIntoDB = async (payload: CreateCategoryPayload) => {
  const exists = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  if (exists) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Category "${payload.name}" already exists`,
    );
  }
  const category = await prisma.category.create({ data: payload });
  return category;
};

const updateCategoryInDB = async (
  id: string,
  payload: UpdateCategoryPayload,
) => {
  await prisma.category.findUniqueOrThrow({ where: { id } });

  if (payload.name) {
    const clash = await prisma.category.findUnique({
      where: { name: payload.name },
    });
    if (clash && clash.id !== id) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Category "${payload.name}" already exists`,
      );
    }
  }

  const category = await prisma.category.update({ where: { id }, data: payload });
  return category;
};

const deleteCategoryFromDB = async (id: string) => {
  const category = await prisma.category.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { services: true } } },
  });

  if (category._count.services > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a category that has services",
    );
  }

  await prisma.category.delete({ where: { id } });
  return { id };
};

export const categoryService = {
  getAllCategoriesFromDB,
  createCategoryIntoDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
};
