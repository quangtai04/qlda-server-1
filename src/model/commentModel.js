const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    content: String,
  },
  { timestamps: true }
);
const Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;
