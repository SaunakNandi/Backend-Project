import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlwwares/multer.middleware.js";

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
// router.route("/login").post(loginUser);
export default router;
