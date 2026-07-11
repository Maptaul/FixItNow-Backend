import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const isProd = process.env.NODE_ENV === "production";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { accessToken } = await authService.loginUser(req.body);

  // In production the cookie is cross-site over HTTPS (none + secure);
  // in local dev "lax" works over http without secure.
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: { accessToken },
  });
});

export const authController = {
  loginUser,
};
