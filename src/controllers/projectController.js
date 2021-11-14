const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const Project = require("../model/projectModel");
const Post = require("../model/postModel");
const User = require("../model/userModel");
const Comment = require("../model/commentModel");
const Task = require("../model/taskModel");
const { getNameAndAvatar } = require("./userController");

module.exports.addProject = async (req, res) => {
  // var io = req.app.get("io");
  let body = req.body;
  let userId = await getCurrentId(req);
  body.userAdmin = [userId];
  body.users = [userId];
  try {
    let user = await User.findById(userId);
    if (user) {
      var project = new Project(body);
      project.save(async function (err, obj) {
        if (err) {
          return handleErrorResponse(res, 400, null, "Add project thất bại!");
        }
        user.projects.push(project._id);
        await user.save();
        return handleSuccessResponse(
          res,
          200,
          { project: project },
          "Add project thành công!"
        );
      });
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy User!");
  }
};
module.exports.joinProject = async (req, res) => {
  let { userId, projectId } = req.body;
  try {
    let project = await Project.findById(projectId);
    let user = await User.findById(userId);
    if (project.users.indexOf(userId) !== -1) {
      // thuộc mảng users
      return handleErrorResponse(res, 400, "User đã thuộc project từ trước!");
    } else {
      project.users.push(user._id);
      await project.save();
      user.projects.push(project._id);
      await user.save();
      return handleSuccessResponse(
        res,
        200,
        { project: project },
        "Join project thành công!"
      );
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Join project thất bại!");
  }
};


module.exports.deleteProject = async (req, res) => {
  let { projectId } = req.body;
  let userId = await getCurrentId(req);
  if (projectId) {
    let project = await Project.findById(projectId);
    let user = await User.findById(userId);
    if (!project)
      return handleErrorResponse(res, 400, "Không tồn tại projectID");
    if (project.userAdmin.indexOf(userId) === -1) {
      // không thuộc list admin project
      return handleErrorResponse(res, 400, "Bạn không có quyền xóa Project");
    }
    // xóa project list của mỗi user
    project.users.forEach(async (id) => {
      let user = await User.findById(id);
      user.projects.splice(user.projects.indexOf(projectId), 1);
      user.save();
    });
    await Project.deleteOne({ _id: projectId });

    // let query = await User.deleteProjectCreated(project.userId, projectId);
    // if (!query) {
    //   return handleErrorResponse(res, 400, "Error deleteProjectCreated");
    // }
    // let listUserJoin = await project.get("userJoin");
    // listUserJoin.map(async (value, i) => {
    //   let query = await User.outProject(value, projectId);
    //   if (!query) {
    //     return handleErrorResponse("Error outProject!");
    //   }
    // });
    // let listPost = await Post.find({ projectId: projectId });
    // listPost.map(async (value, i) => {
    //   await Comment.remove({ postId: value._id });
    //   await Post.findOneAndRemove({ _id: value._id });
    // });
    // await Task.remove({ projectId: projectId });
    // await Project.remove({ _id: projectId });
    return handleSuccessResponse(res, 200, project, "Xóa thành công");
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại projectID");
  }
};

module.exports.getProject = async (req, res) => {
  //full my project
  try {
    let userId = await getCurrentId(req);
    await User.findById(userId)
      .populate("projects")
      .then((result) => {
        return handleSuccessResponse(res, 200, result, "Thành công");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    return handleErrorResponse(res, 400, "Lỗi không thể lấy dữ liệu!");
  }
};
module.exports.getAllProject = async (req, res) => {
  try {
    let listProject = await Project.find({});
    return handleSuccessResponse(res, 200, listProject, "Thành công");
  } catch (error) {
    return handleErrorResponse(res, 400, "Không thể lấy dữ liệu");
  }
};
module.exports.getProjectById = async (req, res) => {
  let { projectId } = req.body;
  try {
    await Project.findOne({ _id: projectId })
      .populate("users")
      .then((result) => {
        return handleSuccessResponse(res, 200, result, "Thành công");
      });
  } catch (error) {
    return handleErrorResponse(res, 400, "Không tồn tại project");
  }
};
// module.exports.getProjectJoined = async (req, res) => {
//   let userId = await getCurrentId(req);
//   try {
//     let listProjectIdJoin = await (
//       await User.findOne({ _id: userId })
//     ).get("projectJoin");
//     let listProjectJoin = [];
//     for (var i = 0; i < listProjectIdJoin.length; i++) {
//       listProjectJoin.push(
//         await Project.findOne({ _id: listProjectIdJoin[i] })
//       );
//     }
//     return handleSuccessResponse(
//       res,
//       200,
//       { projectJoined: listProjectJoin },
//       "Thành công"
//     );
//   } catch (error) {
//     return handleErrorResponse(res, 400, "Lỗi không thể lấy dữ liệu");
//   }
// };
module.exports.getChatProject = async (req, res) => {
  let { projectId } = req.body;
  let project = await Project.findById(projectId);
  if (project) {
    return handleSuccessResponse(
      res,
      200,
      { listChat: project.chat },
      "Lấy comments thành công!"
    );
  } else return handleErrorResponse(res, 400, "Không tồn tại projectId");
};
module.exports.getUserJoin = async (req, res) => {
  let { projectId } = req.body;
  let project = await Project.findById(projectId)
    .populate("users")
    .then((result) => {
      return handleSuccessResponse(res, 200, result, "Thành công");
    })
    .catch((err) => {
      console.log(err);
    });
  if (project) {
    let listUser = project.userJoin;
    listUser.push(project.userId);
    let listProfile = [];
    return handleSuccessResponse(
      res,
      200,
      { listUser: listProfile },
      "Thành công"
    );
  }
  return handleErrorResponse(res, 400, "Thất bại");
};
module.exports.setAdmin = async (req, res) => {
  let { projectId, memberId } = req.body;
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  if (project) {
    if (project.userAdmin.indexOf(userId) !== -1) {
      if (project.users.indexOf(memberId) !== -1) {
        if (project.userAdmin.indexOf(memberId) === -1) {
          project.userAdmin.push(memberId);
          project.save();
          return handleSuccessResponse(res, 200, project, "Thành công");
        } else {
          return handleErrorResponse(res, 400, "Người dùng đã admin từ trước!");
        }
      } else {
        return handleErrorResponse(
          res,
          400,
          "Member chưa là thành viên project!"
        );
      }
    } else {
      return handleErrorResponse(res, 400, "Bạn không có quyền này!");
    }
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại Project");
  }
};
module.exports.dropAdmin = async (req, res) => {
  let { projectId, memberId } = req.body;
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  if (project) {
    if (project.userAdmin[0] !== userId) {
      if (project.userAdmin.indexOf(memberId) !== -1) {
        project.userAdmin.splice(project.userAdmin.indexOf(memberId), 1);
        project.save();
        return handleSuccessResponse(res, 200, project, "Thành công");
      } else {
        return handleErrorResponse(res, 400, "Member chưa là admin project!");
      }
    } else {
      return handleErrorResponse(res, 400, "Bạn không có quyền này!");
    }
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại Project");
  }
};
module.exports.deleteMember = async (req, res) => {
  let { projectId, memberId } = req.body;
  try {
    let userId = await getCurrentId(req);
    let project = await Project.findById(projectId);
    if (project) {
      if (memberId === project.userAdmin[0])
        return handleErrorResponse(
          res,
          400,
          "Không thể xóa người tạo ra khỏi Project"
        );
      if (project.userAdmin.indexOf(userId) !== -1) {
        if (project.users.indexOf(memberId) !== -1) {
          project.users.splice(project.users.indexOf(memberId), 1);
          project.save();
          return handleSuccessResponse(res, 200, project, "Thành công");
        } else {
          return handleErrorResponse(
            res,
            400,
            "Nguời dùng không thuộc project"
          );
        }
      }
      return handleErrorResponse(res, 400, "Không có quyền admin");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, error + "");
  }
};
