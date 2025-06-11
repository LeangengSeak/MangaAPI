import express, { Response, Request, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { config } from "./config/app.config";
import connectDatabase from "./database/db";
import { asyncHandler } from "./middlewares/asyncHandler";
import { HTTPSTATUS } from "./config/http.config";

import authRoutes from "./routes/auth.route";

// Create Express application
const app = express();

// Constants
const BASE_PATH = config.BASE_PATH;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);

// Routes
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Welcome to the API!✨🍀",
    });
  })
);

app.use(`${config.BASE_PATH}/auth`, authRoutes);

// Start server
app.listen(config.PORT, async () => {
  await connectDatabase();
  console.log(
    `Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`
  );
});
