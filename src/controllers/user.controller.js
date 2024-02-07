import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


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
    filePath:avatarLocalPath,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  //console.log(user);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // don't select password and refreshtoken
  );
  if (!createdUser) throw new ApiError(500, "User failed");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const newrefreshToken = user.generateRefreshToken();

    user.refreshToken = newrefreshToken;
    // this is done because while saving, the required field(used while creating userSchema) gets in and ask for that perticular field so we are asking to ignore the validation
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newrefreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal Error for refresh and access token");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // check login by username or email
  // find the user
  // password check
  // generate access and refresh token  ( concept explained in Complete backend developer course part 2 (2:44))
  //  
  const { email, username, password } = req.body;
  console.log(email)
  // if (!username || !email)
  if (!username && !email) {
    throw new ApiError(400, "username or email required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  //console.log(user);
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken: newrefreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  //console.log(user);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // securing the cookie
  const options = { // discussed in NOTE.txt
    // these options will not allow to modify cookies from frontend but can be done from server
    httpOnly: true,
    secure: true,
  };
  
  // sending cookies
  // we are getting this .cookie() from cookieParser()
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          // this will allow user to save accessToken and refreshToken may be in localStorage or may be he need it for personal use/developement
          user: loggedInUser,
          accessToken,
          newrefreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null, // this removes the field from document
      },
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


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedToken= jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)  // decrypt the encrypted token
  
    const user = await User.findById(decodedToken?._id)
    if (!user) throw new ApiError(404, "Invalid refresh token");
    
    if(incomingRefreshToken!==user?.refreshToken) throw new ApiError(401, "Refresh token os expired or has been used");
  
    const options={
      httpOnly: true,
      secure: true,
    }
    const {accessToken,new_refreshToken}=await generateAccessAndRefreshTokens(user._id)
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",new_refreshToken,options).json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken:new_refreshToken,
        },
        "Access token refreshed successfully"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message,"Invalid refresh token")
  }
});

const changeCurrentPassword=asyncHandler(async (req,res) => {
  const {oldPassword,newPassword}=req.body

  const user=await User.findById(req.user?._id)  // else try req.user?._id

  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(isPasswordCorrect) throw new ApiError(400,"Invalid password")
  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200).json(new ApiResponse(200,user,"Password changed successfully"))
})

// login user already injected in req.user in auth.middleware's verifyJWT method
const getCurrentUser=asyncHandler(async (req,res) => {
  return res.status(200).json(new ApiResponse(200,req.user,"Current User fetched successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullName,email} =req.body

  if(!fullName || !email)
    throw new ApiError(400,"All fields are required")

  const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        fullName,
        email,
      }
    },
    {new:true}
    ).select("-password")  // ignore password whhile updating

    return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"))
})


const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  console.log("Avatar Path", avatarLocalPath)

  if(!avatarLocalPath) throw new ApiError(400,"cannot find avatar")

  const person = await User.findById(req.user?._id)
  const filePath=person.filePath

  await deleteOnCloudinary(filePath)

  const avatar=await uploadOnCloudinary(avatarLocalPath)
  console.log("avatar", avatar)

  if(!avatar) throw new ApiError(400,"Error uploading avatar")

  const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        avatar:avatar.url,
        filePath:avatarLocalPath
      }
    },
    {new:true}).select("-password") 
  return res.status(200).json(new ApiResponse(200,user,"Avatar Image updated"))    
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{

  const avatarCoverImagePath=req.file?.path
  if(!avatarCoverImagePath) throw new ApiError(400,"cannot find cover image")

  const coverImage=await uploadOnCloudinary(avatarCoverImagePath)
  console.log("avatar", coverImage)

  if(!coverImage) throw new ApiError(400,"Error uploading coverImage")

  const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        coverImage:coverImage.url,
      }
    },
    {new:true}).select("-password") 
    return res.status(200).json(new ApiResponse(200,user,"Cover Image updated"))
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage };
