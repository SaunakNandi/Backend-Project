// This will verify if the user exist or not

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

// unused res can written as async (req, _, next)
export const verifyJWT = asyncHandler(async (req, res, next) => {
  // accessToken is not present in mobile
  try {
    const token =
      req.cookies?.accessToken ||
      // Authorization: Bearer <token> - we need only the token and not the `Bearer ` (jwt.io/introduction)
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized request");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError(401, "Invalid Access Token");

    // Adding a new object in `req`
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access to token");
  }
});
