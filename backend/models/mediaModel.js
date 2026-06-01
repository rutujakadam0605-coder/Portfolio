import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    tags: [String],
    url: String,
    isVideo: Boolean,
    orientation: {
     type: String,
     default: "horizontal",
  }
  },
  { timestamps: true }
);

// 👇 force collection name = "media"
export default mongoose.model("Media", MediaSchema, "media");

