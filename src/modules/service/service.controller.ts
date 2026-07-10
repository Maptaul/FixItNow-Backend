import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceFilters } from "./service.interface";
import { serviceService } from "./service.service";

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await serviceService.getAllServicesFromDB(
    req.query as ServiceFilters,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Services fetched successfully",
    data,
    meta,
  });
});

const createService = catchAsync(async (req: Request, res: Response) => {
  const service = await serviceService.createServiceIntoDB(
    req.user?.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Service created successfully",
    data: service,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const service = await serviceService.updateServiceInDB(
    req.user?.id as string,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service updated successfully",
    data: service,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const result = await serviceService.deleteServiceFromDB(
    req.user?.id as string,
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service deleted successfully",
    data: result,
  });
});

export const serviceController = {
  getAllServices,
  createService,
  updateService,
  deleteService,
};
