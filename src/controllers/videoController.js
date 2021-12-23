const Video = require("../model/videoModel");
const Project = require("../model/projectModel");
const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const User = require("../model/userModel");
module.exports.addVideo = async (req, res) => {
  let { projectId, security } = req.body;
  let userId = await getCurrentId(req);
  let user = await User.findById(userId);
  if (!user) {
    return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
  }
  if (projectId) {
    let project = await Project.findById(projectId);
    if (project) {
      let video = new Video({
        ...req.body,
        authorId: userId,
      });
      if (security === "Private") {
        project.training.push({ type: "video", videoId: video });
        await project.save();
      }
      video.save(async function (err, obj) {
        if (err) {
          return handleErrorResponse(res, 400, null, "Thất bại");
        }
        return handleSuccessResponse(res, 200, video, "Thành công");
      });
    } else {
      return handleErrorResponse(res, 400, "Không tồn tại project");
    }
  }
};
