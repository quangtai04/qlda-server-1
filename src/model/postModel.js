const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var postSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    projectId:{ type: Schema.Types.ObjectId, ref: "Project" },
    content: String,
    files: {
      type: [{ type: String }],
      default: [],
    },
  },
  { timestamps: true }
);
const Post = mongoose.model("post", postSchema);

module.exports = Post;
