const {
  getCurrentId,
  handleErrorResponse,
  handleSuccessResponse,
} = require("../helper/responseHelper");
const Notification = require("../model/notificationModel");
const Project = require("../model/projectModel");
const User = require("../model/userModel");
const io = require("socket.io-client");
const socket = io.connect("http://localhost:3002/project", { reconnect: true });
/**
 *
 * @param {*} data userId: string, projectId: string, content?: string, authorId: string, taskId?: string,
 *                 blogId?: string, type: string, administratorId: string
 * @param {*} callback () => void
 */
exports.addNotificationOneUser = async (data, callback) => {
  try {
    let noti = new Notification({
      content: data.content || "",
      userId: data.userId,
      authorId: data.authorId,
      projectId: data.projectId || null,
      taskId: data.taskId || null,
      type: data.type,
      blogId: data.blogId || null,
      administratorId: data.administratorId || null,
    });
    noti.save(async (err, obj) => {
      if (err) {
        callback("Một lỗi không mong muốn đã xảy ra");
        return;
      }
      let userNoti = await User.findById(data.userId);
      userNoti.notifications.push(noti._id);
      userNoti.save((err, obj) => {
        if (err) {
          checkError = true;
          return;
        }
        socket.emit("newNotification", {
          userId: data.userId,
          projectId: data.projectId,
          authorId: data.authorId,
          type: data.type,
        });
        callback(null);
      });
    });
  } catch (err) {
    callback("Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 * get all notifications of one user
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getNotifications = async (req, res) => {
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId).populate({
      path: "notifications",
      populate: [
        {
          path: "authorId",
          select: "_id avatar role email username",
        },
        {
          path: "projectId",
          select: "_id name",
        },
        {
          path: "taskId",
          select: "_id name",
        },
        {
          path: "blogId",
        },
        { path: "administratorId" },
      ],
    });
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
    return handleSuccessResponse(res, 200, user.notifications, "Thành công");
  } catch (err) {
    return handleSuccessResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 * delete notification
 * @param {* notificationId} req
 * @param {*} res
 */
module.exports.deleteNotification = async (req, res) => {
  let { notificationId } = req.body;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
    let noti = await Notification.findById(notificationId);
    if (!noti) {
      return handleErrorResponse(res, 400, "Thông báo không còn tồn tại");
    }
    user = await User.findById(userId);
    if (user.notifications.includes(notificationId)) {
      await Notification.findByIdAndRemove(notificationId);
      user.notifications.splice(user.notifications.indexOf(notificationId), 1);
      user.save();
      return this.getNotifications(req, res);
    } else {
      return handleErrorResponse(res, 400, "Bạn không có quyền xóa thông báo");
    }
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
