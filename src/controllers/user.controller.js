import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/* { using asyncHandler you can see the error while sending api request in `Thunder Client`
 if you remove the asyncHandler and use simple try catch you can onlu see the error in cmd prompt } */

const registerUser = asyncHandler(async (req, res) => {
  // STEPS -
  // get user details from frontend
  // validation
  // check if user already exists
  // check for images, check for avatar
  // upload them to cloudinary
  // create user object - create entry in db
  // remove password and refresh token field from the response
  // check for user creation
  // return respon

  // the form field passed during api testing is the `req` value
  console.log(req);
  const { fullName, email, username, password } = req.body;

  // validation for empty field
  if (
    [fullName, email, username, password].some(
      (field) =>
        /// if the field exist then trim it, if still it is empty then automatically return true
        // If any one field return true it means it was empty
        field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }], // find using username or email
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // provided by multer

  //console.log(req.files?.avatar[0]?.path);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Path not found");

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  )
    coverImageLocalPath = req.files.coverImage[0].path;

  const avatar = await uploadOnCloudinary(avatarLocalPath); // uploading might takes time
  //console.log(avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) throw new ApiError(400, "Avatar fle is required");

  // creating the user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  //console.log(user);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // don't select password and refreshtoken
  );
  if (!createdUser) throw new ApiError(500, "Uer failed");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
