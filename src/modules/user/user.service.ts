import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { RegisterUserPayload, UpdateProfilePayload } from "./user.interface";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, role = "CUSTOMER" } = payload;

  const isUserExist = await prisma.user.findUnique({ where: { email } });
  if (isUserExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email",
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  // A technician gets an empty profile created alongside their account.
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      technicianProfile: role === "TECHNICIAN" ? { create: {} } : undefined,
    },
    omit: { password: true },
    include: { technicianProfile: true },
  });

  return user;
};

const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
    include: { technicianProfile: true },
  });
  return user;
};

const updateMyProfileInDB = async (
  userId: string,
  payload: UpdateProfilePayload,
) => {
  const data: { name?: string; password?: string } = {};

  if (payload.name) data.name = payload.name;
  if (payload.password) {
    data.password = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds) || 10,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    omit: { password: true },
    include: { technicianProfile: true },
  });
  return updatedUser;
};

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileInDB,
};
