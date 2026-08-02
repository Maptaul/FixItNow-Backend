import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { UpdateUserStatusPayload, UserFilters } from "./admin.interface";

const ROLES = ["CUSTOMER", "TECHNICIAN", "ADMIN"];
const STATUSES = ["ACTIVE", "BLOCKED"];

const getAllUsersFromDB = async (filters: UserFilters) => {
  const where: Prisma.UserWhereInput = {};
  if (filters.role && ROLES.includes(filters.role)) {
    where.role = filters.role as Prisma.EnumRoleFilter["equals"];
  }
  if (filters.status && STATUSES.includes(filters.status)) {
    where.activeStatus =
      filters.status as Prisma.EnumActiveStatusFilter["equals"];
  }

  const users = await prisma.user.findMany({
    where,
    omit: { password: true },
    orderBy: { createdAt: "desc" },
    include: { technicianProfile: true },
  });
  return users;
};

const updateUserStatusInDB = async (
  adminId: string,
  targetId: string,
  payload: UpdateUserStatusPayload,
) => {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (target.id === adminId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own status",
    );
  }
  if (target.role === "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot change another admin's status",
    );
  }

  const user = await prisma.user.update({
    where: { id: targetId },
    data: { activeStatus: payload.activeStatus },
    omit: { password: true },
  });
  return user;
};

const getAllBookingsFromDB = async () => {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true, email: true, avatarUrl: true } },
      technician: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      service: { select: { id: true, title: true } },
      payment: true,
      review: true,
    },
  });
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusInDB,
  getAllBookingsFromDB,
};
