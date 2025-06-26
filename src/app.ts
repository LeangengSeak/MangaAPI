import express, { Response, Request, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fileUpload from "express-fileupload";

import { config } from "./config/app.config";
import connectDatabase from "./database/db";
import { asyncHandler } from "./middlewares/asyncHandler";
import { HTTPSTATUS } from "./config/http.config";
import passport from "./middlewares/passport";
import { authenticateJWT } from "./shared/strategies/jwt.strategy";
import { errorHandler } from "./middlewares/globalError";

import authRoutes from "./routes/auth.route";
import sessionRoutes from "./routes/session.route";
import adminRoutes from "./routes/admin.route";
import mangaRoutes from "./routes/manga.route";
import episodeRoutes from "./routes/episode.route";
import favoriteRoutes from "./routes/favorite.route";
import statRoutes from "./routes/stat.route";

// Create Express application
const app = express();

// Constants
const BASE_PATH = config.BASE_PATH;

// Middleware setup
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

app.use(passport.initialize());

// Routes
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Welcome to the API!✨🍀",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRoutes);
app.use(`${BASE_PATH}/favorite`, authenticateJWT, favoriteRoutes)
app.use(`${BASE_PATH}/admin`, authenticateJWT, adminRoutes);
app.use(`${BASE_PATH}/stat`, authenticateJWT, statRoutes);
app.use(`${BASE_PATH}/manga`, mangaRoutes)
app.use(`${BASE_PATH}/episode`, authenticateJWT, episodeRoutes);

app.use(errorHandler);

// Start server
app.listen(config.PORT, async () => {
  await connectDatabase();
  console.log(
    `Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`
  );
});
