import mongoose, { Schema } from "mongoose";

const VideoSchema = new Schema(
  {
    videoFile: { type: String, required: true }, // cloudinary url
    thumbnail: { type: String, required: true }, // cloudinary url
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // cloudinary url
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Video = mongoose.model("Video", VideoSchema);
