import mongoose, { Schema } from "mongoose";

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
    fullname: { type: String, required: true, trim: true, index: true },
    avatar: { type: String, required: true }, // cloudinary url provides url whenever we save some image,video etc.
    coverImage: { type: String }, // cloudinary url
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    password: { type: String, required: [true, "Password is required"] },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
