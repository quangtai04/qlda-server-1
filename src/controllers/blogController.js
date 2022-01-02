const Blog = require("../model/blogModel");
const Project = require("../model/projectModel");
const Administrator = require("../model/administratorModel");
const notificationController = require("../controllers/notificationController");
const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const User = require("../model/userModel");
module.exports.addBlog = async (req, res) => {
  let { projectId, security } = req.body;
  let userId = await getCurrentId(req);
  let user = await User.findById(userId);
  let blog;
  if (!user) {
    return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
  }
  let admin = await User.find({ role: "Admin" });
  if (projectId) {
    let project = await Project.findById(projectId);
    if (project) {
      blog = new Blog({
        ...req.body,
        status: 1,
        authorId: userId,
      });
      project.training.push({ type: "blog", blogId: blog });
      await project.save();
    } else {
      return handleErrorResponse(res, 400, "Không tồn tại project");
    }
  } else {
    blog = new Blog({
      ...req.body,
      status: 1,
      projectId: null,
      authorId: userId,
    });
    if (security === "Public" && req.body.money === "Money") {
      // add new notification to admin
      if (admin) {
        blog.status = 0;
        let administrator = new Administrator({
          type: "blog",
          status: 0,
          authorId: user,
          blogId: blog._id,
        });
        await administrator.save();
        for (let i = 0; i < admin.length; i++) {
          notificationController.addNotificationOneUser(
            {
              userId: admin[i]._id.toString(),
              projectId: null,
              authorId: userId,
              blogId: blog._id,
              type: "add-blog",
            },
            () => {}
          );
        }
      }
    }
  }
  user.blogs.push(blog._id);
  user.save();
  blog.save(async function (err, obj) {
    if (err) {
      return handleErrorResponse(res, 400, null, "Thất bại");
    }
    user.blogs.push(blog);
    return handleSuccessResponse(res, 200, blog, "Thành công");
  });
};
/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
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
  let _id = await getCurrentId(req);
  let blog;
  if (userId === _id) {
    // get all blog
    blog = await Blog.find({ authorId: userId }).limit(
      numberBlog ? numberBlog : 5
    );
  } else {
    // get all blog public
    blog = await Blog.find({ authorId: userId, security: "Public" }).limit(
      numberBlog ? numberBlog : 5
    );
  }
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
