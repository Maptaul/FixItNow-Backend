import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser } from "./auth.interface";

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({ where: { email } });
  // Generic message so we don't reveal whether the email exists.
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.activeStatus === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "User is blocked. Please contact support.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiry_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiry_in as SignOptions,
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "No refresh token provided");
  }

  const verified = jwtUtils.verifyToken(token, config.jwt_refresh_secret);
  if (!verified.success) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const { id } = verified.data as JwtPayload;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }
  if (user.activeStatus === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "User is blocked. Please contact support.",
    );
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const newAccessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiry_in as SignOptions,
  );

  return { newAccessToken };
};

export const authService = {
  loginUser,
  refreshToken,
};
