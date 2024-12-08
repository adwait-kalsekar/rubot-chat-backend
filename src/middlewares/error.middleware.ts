import { ErrorRequestHandler, Response, Request, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import dotenv from "dotenv";

import ApiError from "../utils/ApiError";
import logger from "../utils/logger";

dotenv.config();

const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  if (err instanceof ZodError) {
    // Handle Zod validation errors
    const statusCode = 400;
    const message = "Validation Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode! || error instanceof mongoose.Error ? 400 : 500;

    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  logger.error(error.message);

  // Use next() to conform to expected behavior
  res.status(error.statusCode).json(response);
  return next(); // Ensures middleware conforms to TypeScript
};

export default errorHandler;
