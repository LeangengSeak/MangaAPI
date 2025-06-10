const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { config } = require("./config/app.config");
const connectDatabase = require("./database/db");

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

// Start server
app.listen(config.PORT, async () => {
    await connectDatabase();
    console.log(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});
