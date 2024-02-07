import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    // we are using index:true as this wll help us for searching username
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: { type: String, required: true, trim: true, index: true },
    avatar: { type: String, required: true }, // cloudinary url provides url whenever we save some image,video etc.
    filePath: { type: String},
    coverImage: { type: String }, // cloudinary url
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    password: { type: String, required: [true, "Password is required"] },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if not modified don't update the password

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// bcrypt can hash the password and can also compare the password
userSchema.methods.isPasswordCorrect = async function (password) {
  //this.password is the encrypted password
  return await bcrypt.compare(password, this.password);
};

// creating a method to generate access and refresh token

userSchema.methods.generateAccessToken = function () {
  //payload or data
  return jwt.sign(
    // return the access token after being generated
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
