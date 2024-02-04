import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]), //middleware
  registerUser
);

router.route("/login").post(loginUser);

// secured routes

// next() used in verifyJWT() will help to run logoutUser() after verifyJWT is completed
router.route("/logout").post(verifyJWT, logoutUser);


// discussed in the part2 video tutorial at 1:11:25
// endpoint for refresh tokens
router.route("/refresh-token").post(refreshAccessToken);

export default router;
