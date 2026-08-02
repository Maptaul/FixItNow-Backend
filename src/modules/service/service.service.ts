import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  CreateServicePayload,
  ServiceFilters,
  UpdateServicePayload,
} from "./service.interface";

const getAllServicesFromDB = async (filters: ServiceFilters) => {
  const {
    categoryId,
    location,
    minPrice,
    maxPrice,
    minRating,
    search,
    page = "1",
    limit = "10",
  } = filters;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.ServiceWhereInput = {};

  if (categoryId) where.categoryId = categoryId;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const technicianFilter: Prisma.TechnicianProfileWhereInput = {};
  if (location)
    technicianFilter.location = { contains: location, mode: "insensitive" };
  if (minRating) technicianFilter.avgRating = { gte: Number(minRating) };
  if (Object.keys(technicianFilter).length) where.technician = technicianFilter;

  const [data, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        technician: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    }),
    prisma.service.count({ where }),
  ]);

  return { data, meta: { page: pageNum, limit: limitNum, total } };
};

const getMyProfileOrThrow = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
  }
  return profile;
};

const ensureCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
};

const createServiceIntoDB = async (
  userId: string,
  payload: CreateServicePayload,
) => {
  const profile = await getMyProfileOrThrow(userId);
  await ensureCategoryExists(payload.categoryId);

  const service = await prisma.service.create({
    data: { ...payload, technicianId: profile.id },
    include: { category: true },
  });
  return service;
};

const updateServiceInDB = async (
  userId: string,
  id: string,
  payload: UpdateServicePayload,
) => {
  const profile = await getMyProfileOrThrow(userId);

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }
  if (service.technicianId !== profile.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only manage your own services",
    );
  }
  if (payload.categoryId) await ensureCategoryExists(payload.categoryId);

  const updated = await prisma.service.update({
    where: { id },
    data: payload,
    include: { category: true },
  });
  return updated;
};

const deleteServiceFromDB = async (userId: string, id: string) => {
  const profile = await getMyProfileOrThrow(userId);

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }
  if (service.technicianId !== profile.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only manage your own services",
    );
  }

  await prisma.service.delete({ where: { id } });
  return { id };
};

export const serviceService = {
  getAllServicesFromDB,
  createServiceIntoDB,
  updateServiceInDB,
  deleteServiceFromDB,
};
