const Blog = require("../model/blogModel");
const Project = require("../model/projectModel");
const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const User = require("../model/userModel");
const Project = require("../model/projectModel");
module.exports.addBlog = async (req, res) => {
  let { title, content, describe, projectId } = req.body;
  let userId = await getCurrentId(req);
  let user = await User.findById(userId);
  var blog;
  if (!user) {
    return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
  }
  if (projectId) {
    let project = await Project.findById(projectId);
    if (project) {
      blog = new Blog({
        authorId: userId,
        title: title,
        describe: describe,
        content: content,
        projectId: projectId,
      });
    } else {
      return handleErrorResponse(res, 400, "Không tồn tại project");
    }
  } else {
    blog = new Blog({
      authorId: userId,
      title: title,
      describe: describe,
      content: content,
      projectId: null,
    });
  }
  blog.save(async function (err, obj) {
    if (err) {
      return handleErrorResponse(res, 400, null, "Thất bại");
    }
    user.blogs.push(blog);
    return handleSuccessResponse(res, 200, blog, "Thành công");
  });
};
module.exports.getBlog = async (req, res) => {
  let userId = await getCurrentId(req);
  let user = await User.findById(userId);
  let { numberBlog, blogId } = req.body;
  if (!user) {
    return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
  }
  if (blogId) {
    await Blog.findById(blogId)
      .populate({
        path: "authorId",
        select: "username avatar role",
      })
      .then((blog) => {
        return handleSuccessResponse(res, 200, blog, "Thành công");
      });
  } else {
    await Blog.find({})
      .limit(numberBlog ? numberBlog : 5)
      .populate({
        path: "authorId",
        select: ["username", "avatar", "role"],
      })
      .then((blog) => {
        return handleSuccessResponse(res, 200, blog, "Thành công");
      });
  }
};
module.exports.getBlogUser = async (req, res) => {
  let { userId, numberBlog } = req.body;
  let blog = await Blog.find({ authorId: userId }).limit(
    numberBlog ? numberBlog : 5
  );
  return handleSuccessResponse(res, 200, blog, "Thành công");
};
module.exports.updateBlog = async (req, res) => {
  let { title, content, describe, blogId } = req.body;
  let post = await Post.findOneAndUpdate(
    { _id: blogId },
    { content: content },
    { title: title },
    { describe: describe }
  );
  blog.save(async function (err, obj) {
    if (err) {
      return handleErrorResponse(res, 400, null, "Thất bại");
    }
    return handleSuccessResponse(res, 200, {}, "Thành công");
  });
};
/**
 *
 * @param {*} req projectId
 * @param {*} res
 */
module.exports.getBlogsProject = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId } = req.query;
  try {
    let user = await User.findById(userId);
    let project = await Project.findById(projectId);
    if (user && project) {
      let blogs = await Blog.find({ projectId: projectId }).populate({
        path: "authorId",
        select: ["username", "role", "avatar"],
      });
      return handleSuccessResponse(res, 200, blogs || [], "Thành công");
    } else {
      return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Lỗi lấy dữ liệu");
  }
};
module.exports.removeBlog = async (req, res) => {
  let { blogId } = req.body;
  let blog = await Blog.findByIdAndRemove(blogId);
  if (!blog) {
    return handleErrorResponse(res, 400, "Không tồn tại blog");
  }
  let userId = await getCurrentId(req);
  let user = await User.findById(userId);
  user.blogs.splice(user.blogs.indexOf(blogId), 1);
  user.save();
  return handleSuccessResponse(res, 200, {}, "Thành công");
};
