import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  changeCurrentPassword,
  updateAccountDetails,
  getWatchHistory
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
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountDetails);   // not using post as it will update all the details

//upload.single("avatar") is the middleware
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);  // using post wll upfate all 
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route.apply("/history").get(verifyJWT,getWatchHistory);

export default router;
