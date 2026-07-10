import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  SetAvailabilityPayload,
  TechnicianFilters,
  UpdateTechnicianProfilePayload,
} from "./technician.interface";

const getAllTechniciansFromDB = async (filters: TechnicianFilters) => {
  const {
    location,
    minRating,
    categoryId,
    page = "1",
    limit = "10",
  } = filters;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.TechnicianProfileWhereInput = {};
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (minRating) where.avgRating = { gte: Number(minRating) };
  if (categoryId) where.services = { some: { categoryId } };

  const [data, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { avgRating: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        services: { include: { category: true } },
      },
    }),
    prisma.technicianProfile.count({ where }),
  ]);

  return { data, meta: { page: pageNum, limit: limitNum, total } };
};

const getTechnicianByIdFromDB = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      services: { include: { category: true } },
    },
  });
  if (!technician) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician not found");
  }

  const reviews = await prisma.review.findMany({
    where: { booking: { technicianId: id } },
    orderBy: { createdAt: "desc" },
  });

  return { ...technician, reviews };
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

const updateProfileInDB = async (
  userId: string,
  payload: UpdateTechnicianProfilePayload,
) => {
  const profile = await getMyProfileOrThrow(userId);
  const updated = await prisma.technicianProfile.update({
    where: { id: profile.id },
    data: payload,
  });
  return updated;
};

const setAvailabilityInDB = async (
  userId: string,
  payload: SetAvailabilityPayload,
) => {
  const profile = await getMyProfileOrThrow(userId);

  const slots = payload.slots.map((s) => ({
    technicianId: profile.id,
    date: new Date(s.date),
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  // Replace the technician's open availability, but never touch booked slots.
  await prisma.$transaction([
    prisma.availabilitySlot.deleteMany({
      where: { technicianId: profile.id, isBooked: false },
    }),
    prisma.availabilitySlot.createMany({ data: slots, skipDuplicates: true }),
  ]);

  const current = await prisma.availabilitySlot.findMany({
    where: { technicianId: profile.id },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return current;
};

export const technicianService = {
  getAllTechniciansFromDB,
  getTechnicianByIdFromDB,
  updateProfileInDB,
  setAvailabilityInDB,
};
