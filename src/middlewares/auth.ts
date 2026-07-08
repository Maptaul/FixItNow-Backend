import { NextFunction, Request, Response } from "express";
import statusCode from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}
// auth (Role.ADMIN, Role.USER, Role.AUTHOR)

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error("No token provided");
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (verifiedToken.success === false) {
      throw new Error(verifiedToken.error || "Token verification failed");
    }
    const { email, name, id, role } = verifiedToken.data as JwtPayload;
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        statusCode: statusCode.FORBIDDEN,
        message:
          "Forbidden: You do not have permission to access this resource",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: statusCode.NOT_FOUND,
        message: "User not found",
      });
    }
    if (user.activeStatus === "BLOCKED") {
      throw new Error("User is blocked. Please contact support.");
    }
    req.user = { email, name, id, role };
    next();
  });
};
