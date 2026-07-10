import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { authRouter } from "./modules/auth/auth.route";
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
  res.send("Hello, World!");
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRoutes.categoryRouter);
app.use("/api/admin/categories", categoryRoutes.adminCategoryRouter);
app.use("/api/services", serviceRoutes.serviceRouter);
app.use("/api/technician/services", serviceRoutes.technicianServiceRouter);
app.use("/api/technicians", technicianRoutes.technicianRouter);
app.use("/api/technician", technicianRoutes.technicianSelfRouter);

app.use(notFound);
app.use(globalErrorHandler);
export default app;
