import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { authRouter } from "./modules/auth/auth.route";
import { bookingRoutes } from "./modules/booking/booking.route";
import { categoryRoutes } from "./modules/category/category.route";
import { serviceRoutes } from "./modules/service/service.route";
import { technicianRoutes } from "./modules/technician/technician.route";
import { userRouter } from "./modules/user/user.route";

const app: Application = express();
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "FixItNow API is running " });
});

app.use("/api/auth", authRouter);
app.use("/api/auth", userRouter);
app.use("/api/categories", categoryRoutes.publicRouter);
app.use("/api/admin/categories", categoryRoutes.adminRouter);
app.use("/api/services", serviceRoutes.publicRouter);
app.use("/api/technician/services", serviceRoutes.technicianRouter);
app.use("/api/technicians", technicianRoutes.publicRouter);
app.use("/api/technician/bookings", bookingRoutes.technicianRouter);
app.use("/api/technician", technicianRoutes.selfRouter);
app.use("/api/bookings", bookingRoutes.customerRouter);

app.use(notFound);
app.use(globalErrorHandler);
export default app;
