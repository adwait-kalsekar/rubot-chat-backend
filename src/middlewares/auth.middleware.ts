import { Request, Response, NextFunction } from "express";
import axios from "axios";

import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { AUTH_BACKEND_URL } from "../constants";

export interface User {
  _id: string;
  email: string;
  username: string;
}

const verifyJwt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    try {
      const response = await axios.get(`${AUTH_BACKEND_URL}/users/getUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data.data as User;

      if (!user) {
        throw new ApiError(401, "Unauthorized");
      }

      req.user = user;

      next();
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid Access Token");
    }
  },
);

export { verifyJwt };
