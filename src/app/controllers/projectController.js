const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../../helper/responseHelper");
const Project = require("../../model/projectModel");
const Post = require("../../model/postModel");
const User = require("../../model/userModel");
const Comment = require("../../model/commentModel");
const { use } = require("../../routers/usersRouter");
const { getNameAndAvatar } = require("./userController");

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
      let newData = [];
      for (let i = 0; i < postList.length; i++) {
        commentList = await Comment.find({ postId: postList[i]._id });
        for (let j = 0; j < commentList.length; j++) {
          let author = await getNameAndAvatar(commentList[j].authorId);
          commentList[j] = commentList[j].toObject();
          commentList[j].author = author;
        }
        let author = await getNameAndAvatar(postList[i].authorId);
        let tmp = postList[i].toObject();
        tmp.comments = commentList;
        tmp.author = author;
        tmp.date = tmp.createdAt.toString().substring(4, 15);
        newData.push(tmp);
      }
      return handleSuccessResponse(
        res,
        200,
        { postList: newData },
        "Lấy danh sách thành công!"
      );
    }
  } catch (error) {
    return handleErrorResponse(res, 401, error);
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
