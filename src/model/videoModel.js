const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var videoSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String },
    videoId: { type: String },
    describe: { type: String },
    security: { type: String, default: "Private" },
    thumbnail: {
      type: String,
      default: "https://img-c.udemycdn.com/course/240x135/692188_9da7_26.jpg",
    },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    money: { type: String, default: "Free" },
  },
  { timestamps: true }
);
const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
