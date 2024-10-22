import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { CORS_ORIGIN } from "./constants";
import logger from "./utils/logger";
import healthCheckRouter from "./routes/healthCheck.route";
import userRouter from "./routes/user.route";
import errorHandler from "./middlewares/error.middleware";

// CONFIGS
dotenv.config();

const morganFormat = ":method :url :status :response-time ms";

const corsConfig: CorsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
};

const morganConfig = {
  stream: {
    write: (message: string) => {
      const logObject = {
        method: message.split(" ")[0],
        url: message.split(" ")[1],
        status: message.split(" ")[2],
        responseTime: message.split(" ")[3],
      };
      logger.info(JSON.stringify(logObject));
    },
  },
};

const jsonConfig = { limit: "16kb" };

const urlencodedConfig = { extended: true };

// EXPRESS APP
const app = express();

// MIDDLEWARES
app.use(cors(corsConfig));
app.use(morgan(morganFormat, morganConfig));
app.use(cookieParser());
app.use(express.json(jsonConfig));
app.use(express.urlencoded(urlencodedConfig));
app.use(express.static("public"));

// ROUTES
app.use("/api/v1/health", healthCheckRouter);
app.use("/api/v1/users", userRouter);

// Error Handler
app.use(errorHandler);

export default app;
