const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var blogSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String },
    describe: { type: String },
    content: { type: String },
    status: { type: Number, default: 0 }, // -1: refuse; 0: undecided; 1: agree 
    security: { type: String, default: "Public" },
    thumbnail: {
      type: String,
      default:
        "https://cdn.fullstack.edu.vn/f8-learning/blog_posts/1671/61b6368a3a089.jpg",
    },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    money: { type: String, default: "Free" },
    comments: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
  },
  { timestamps: true }
);
const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
