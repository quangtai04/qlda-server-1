const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../../helper/responseHelper");
const Project = require("../../model/projectModel");
const Post = require("../../model/postModel");
const User = require("../../model/userModel");
const Comment = require("../../model/commentModel");

module.exports.addProject = async (req, res) => {
  let body = req.body;
  let { userId } = req.body;
  try {
    let user = await User.findById(userId);
    if (user) {
      var project = new Project(body);

      project.save(function (err, obj) {
        if (err)
          return handleErrorResponse(res, 400, null, "Add project thất bại!");

        return handleSuccessResponse(
          res,
          200,
          { projectId: project._id },
          "Add project thành công!"
        );
      });
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy User!");
  }
};
module.exports.getPosts = async (req, res) => {
  let { projectId } = req.body;
  try {
    let project = await Project.findById(projectId);
    if (project) {
      var postList = await Post.find({ projectId: projectId });
      // for (let post in postList) {
      //   commentList = await Comment.find({ postId: post._id });
      //   post.comment = commentList;
      //   console.log(commentList);
      // }
      await postList.forEach(async (post) => {
        commentList = await Comment.find({ postId: post._id });
        post.comment = commentList;
        console.log(commentList);
      });
      return handleSuccessResponse(
        res,
        200,
        { postList: postList },
        "Lấy danh sách thành công!"
      );
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy User!");
  }
};
module.exports.deleteProject = async (req, res) => {
  let { projectId } = req.body;
  if (projectId) {
    let project = await Project.findOneAndRemove({ _id: projectId });
    if (!project)
      return handleErrorResponse(res, 400, "Không tồn tại projectID");
    return handleSuccessResponse(res, 200, null, "Xóa thành công");
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại projectID");
  }
};
