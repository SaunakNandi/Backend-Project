import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // this is done because while saving, the required field(used while creating userSchema) gets in and ask for that perticular field so we are asking to ignore the validation
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal Error for refresh and access token");
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token  ( concept explained in Complete backend developer course part 2 (2:44))

  const { email, username, password } = req.body;

  // if (!username && !email)
  if (!username || !email) {
    throw new ApiError(400, "username or email required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = user
    .findById(user._id)
    .select("-password -refreshToken");

  // sending cookies
  const options = {
    // these options will not allow to modify cookies from frontend but can be done from server
    httpOnly: true,
    secure: true,
  };

  // we are getting this .cookie() from cookieParser()
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          // this will allow user to save accessToken and refreshToken may be in localStorage or may be he need it for personal use/developement
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true, // return the updated data
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});
export { registerUser, loginUser, logoutUser };
