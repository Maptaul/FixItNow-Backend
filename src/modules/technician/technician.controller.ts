import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TechnicianFilters } from "./technician.interface";
import { technicianService } from "./technician.service";

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await technicianService.getAllTechniciansFromDB(
    req.query as TechnicianFilters,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technicians fetched successfully",
    data,
    meta,
  });
});

const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const technician = await technicianService.getTechnicianByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician fetched successfully",
    data: technician,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await technicianService.updateProfileInDB(
    req.user?.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: profile,
  });
});

const getMyAvailability = catchAsync(async (req: Request, res: Response) => {
  const slots = await technicianService.getMyAvailabilityFromDB(
    req.user?.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability fetched successfully",
    data: slots,
  });
});

const setAvailability = catchAsync(async (req: Request, res: Response) => {
  const slots = await technicianService.setAvailabilityInDB(
    req.user?.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability updated successfully",
    data: slots,
  });
});

export const technicianController = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  getMyAvailability,
  setAvailability,
};
