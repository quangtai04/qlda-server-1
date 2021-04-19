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
  // var io = req.app.get("io");
  let body = req.body;
  let userId = await getCurrentId(req);
  body.admin = [userId];
  body.userId = userId;
  try {
    let user = await User.findById(userId);
    if (user) {
      var project = new Project(body);
      project.save(async function (err, obj) {
        if (err)
          return handleErrorResponse(res, 400, null, "Add project thất bại!");
        var createdProject = await User.createProject(userId, project._id);
        if (createdProject) {
          return handleSuccessResponse(
            res,
            200,
            { project: project },
            "Add project thành công!"
          );
        }
      });
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy User!");
  }
};
module.exports.checkJoined = async (req, res) => {
  //req: {projectId}
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  if (project) {
    if (project.userId != userId && project.userJoin.indexOf(userId) == -1) {
      return handleErrorResponse(res, 400, "ErrorSecurity");
    }
    return handleSuccessResponse(res, 200, {}, "SecurityOK");
  } else {
    return handleErrorResponse(res, 400, "ErrorProjectId");
  }
};
module.exports.joinProject = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId } = req.body;
  try {
    let query1 = await Project.userJoin(userId, projectId);
    let query2 = await User.joinProject(userId, projectId);
    return handleSuccessResponse(
      res,
      200,
      { userId: userId, projectId: projectId },
      "Tham gia Project thành công"
    );
  } catch (error) {
    return handleErrorResponse(res, 400, error + "");
  }
};
exports.getListPosts = async (projectId) => {  
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
    return newData;
  }
};
module.exports.getPosts = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId } = req.body;
  try {
    let project = await Project.findById(projectId);
    if (project) {
      // Kiểm tra xem user có quyền truy cập Project hay không
      if (project.userId != userId && project.userJoin.indexOf(userId) == -1) {
        return handleErrorResponse(
          res,
          400,
          "ErrorSecurity"
        )
      }
      let newData = await this.getListPosts(projectId);
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
    let query = await User.deleteProjectCreated(project.userId, projectId);
    if (!query) {
      return handleErrorResponse(res, 400, "Error deleteProjectCreated");
    }
    let listUserJoin = await project.get("userJoin");
    listUserJoin.map(async (value, i) => {
      let query = await User.outProject(value, projectId);
      if (!query) {
        return handleErrorResponse("Error outProject!");
      }
    });
    return handleSuccessResponse(res, 200, project, "Xóa thành công");
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại projectID");
  }
};
module.exports.getProject = async (req, res) => {
  // project created
  try {
    let userId = await getCurrentId(req);
    let userProject = await Project.find({ userId: userId });
    return handleSuccessResponse(res, 200, userProject, "Thành công");
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
    let project = await Project.findOne({ _id: projectId });
    return handleSuccessResponse(res, 200, project, "Thành công");
  } catch (error) {
    return handleErrorResponse(res, 400, "Không tồn tại project");
  }
};
module.exports.getProjectJoined = async (req, res) => {
  let userId = await getCurrentId(req);
  try {
    let listProjectIdJoin = await (await User.findOne({ _id: userId })).get(
      "projectJoin"
    );
    let listProjectJoin = [];
    for (var i = 0; i < listProjectIdJoin.length; i++) {
      listProjectJoin.push(
        await Project.findOne({ _id: listProjectIdJoin[i] })
      );
    }
    return handleSuccessResponse(
      res,
      200,
      { projectJoined: listProjectJoin },
      "Thành công"
    );
  } catch (error) {
    return handleErrorResponse(res, 400, "Lỗi không thể lấy dữ liệu");
  }
};
module.exports.getChat = async (req, res) => {
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

module.exports.addChat = async (req, res) => {
  let body = req.body;
  let { projectId } = req.body;
  let project = await Project.findById(projectId);
  let user = await User.findById(body.userId);
  if (project && user) {
    project.chat.push({
      content: body.content,
      userId: body.userId,
      userName: user.username,
      avatar: user.avatar,
    });
    await project.save();
    return handleSuccessResponse(
      res,
      200,
      { listChat: project.chat },
      "Lấy comments thành công!"
    );
  } else return handleErrorResponse(res, 400, "Không tồn tại projectId");
};
  

module.exports.getUserJoin = async (req, res) => {
  let {projectId} = req.body;
  let userId = await getCurrentId(req);
  let project = await Project.findById(projectId);
  if(project) {
    if(project.userId != userId && project.userJoin.indexOf(userId) == -1) {
      return handleErrorResponse(
        res,
        400,
        "ErrorSecurity"
      )
    }
    let listUser = project.userJoin;
    listUser.push(project.userId);
    let listProfile = [];
    for(let i=0; i<listUser.length; i++) {
      let user = await User.findById(listUser[i]);
      listProfile.push({
        userId: listUser[i],
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        admin: project.admin.indexOf(listUser[i]) != -1 ? "Admin" : "",
      });
    }
    return handleSuccessResponse(
      res,
      200,
      {listUser: listProfile},
      "Thành công"
    )
  }
  return handleErrorResponse(
    res,
    400,
    "Thất bại"
  )
}
