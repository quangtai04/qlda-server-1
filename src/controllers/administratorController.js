const Video = require("../model/videoModel");
const Project = require("../model/projectModel");
const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const User = require("../model/userModel");
const Administrator = require("../model/administratorModel");
const Blog = require("../model/blogModel");
const notificationController = require("../controllers/notificationController");
exports.getAllBlogFunc = async (callback) => {
  let blogsUndecided = await Administrator.find({
    type: "blog",
    status: 0,
  }).populate([
    {
      path: "authorId",
      select: "_id username email avatar role",
    },
    {
      path: "blogId",
      select: "_id title",
    },
  ]);
  let blogs = await Administrator.find({
    type: "blog",
    status: { $ne: 0 },
  }).populate([
    {
      path: "authorId",
      select: "_id username email avatar role",
    },
    {
      path: "blogId",
      select: "_id title",
    },
  ]);
  callback([...blogsUndecided, ...blogs]);
};
module.exports.getAllBlog = async (req, res) => {
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (user) {
      if (user.role !== "Admin") {
        return handleErrorResponse(res, 400, "Không có quyền truy cập");
      }
      this.getAllBlogFunc((data) => {
        return handleSuccessResponse(res, 200, data, "Thành công");
      });
    } else {
      return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
/**
 *
 * @param {*} req status: boolean, type: blog | video | money, _id: string
 * @param {*} res
 */
module.exports.handleStatus = async (req, res) => {
  let userId = await getCurrentId(req);
  let { status, type, _id } = req.body;
  try {
    let user = await User.findById(userId);
    if (user) {
      if (user.role === "Admin") {
        switch (type) {
          case "blog":
            let blog = await Blog.findById(_id);
            let administrator = await Administrator.findOne({
              blogId: _id,
            });
            if (blog && administrator) {
              if (status) {
                blog.status = 1;
                administrator.status = 1;
                let user = await User.findById(blog.authorId);
                user.money = (user.money || 0) + 5000;
                user.save();
                notificationController.addNotificationOneUser(
                  {
                    userId: administrator.authorId,
                    authorId: userId,
                    blogId: blog._id,
                    type: "add-blog-agree",
                  },
                  () => {}
                );
              } else {
                blog.status = -1;
                administrator.status = -1;
                notificationController.addNotificationOneUser(
                  {
                    userId: administrator.authorId,
                    authorId: userId,
                    blogId: blog._id,
                    type: "add-blog-refuse",
                  },
                  () => {}
                );
              }
              blog.save();
              administrator.save((err, obj) => {
                this.getAllBlogFunc((data) => {
                  return handleSuccessResponse(res, 200, data, "Thành công");
                });
              });
            } else {
              return handleErrorResponse(res, 400, "Không tồn tại dữ liệu");
            }
          case "video":
            return handleErrorResponse(
              res,
              400,
              "Một lỗi không mong muốn đã xảy ra"
            );
          case "money":
            let _administrator = await Administrator.findById(_id);
            if (_administrator) {
              if (status) {
                let user = await User.findById(_administrator.authorId);
                if (user.money >= _administrator.amount) {
                  _administrator.status = 1;
                  user.money -= _administrator.amount;
                  notificationController.addNotificationOneUser(
                    {
                      userId: _administrator.authorId,
                      authorId: userId,
                      administratorId: _administrator._id,
                      type: "withdrawal-admin-agree",
                    },
                    () => {}
                  );
                } else {
                  _administrator.status = -1;
                  notificationController.addNotificationOneUser(
                    {
                      userId: _administrator.authorId,
                      authorId: userId,
                      administratorId: _administrator._id,
                      type: "withdrawal-admin-refuse",
                    },
                    () => {}
                  );
                }
              } else {
                _administrator.status = -1;
                notificationController.addNotificationOneUser(
                  {
                    userId: _administrator.authorId,
                    authorId: userId,
                    administratorId: _administrator._id,
                    type: "withdrawal-admin-refuse",
                  },
                  () => {}
                );
              }
              _administrator.save();
              user.save(async (err, obj) => {
                let request0 = await Administrator.find({
                  type: "money",
                  status: 0,
                }).populate({
                  path: "authorId",
                  select: "_id username avatar role email",
                });
                let request1 = await Administrator.find({
                  type: "money",
                  status: { $ne: 0 },
                }).populate({
                  path: "authorId",
                  select: "_id username avatar role email",
                });
                return handleSuccessResponse(
                  res,
                  200,
                  [...request0, ...request1],
                  "Thành công"
                );
              });
            } else {
              return handleErrorResponse(res, 400, "Không tồn tại dữ liệu");
            }
        }
      } else {
        return handleErrorResponse(res, 400, "Không có quyền truy cập");
      }
    } else {
      return handleErrorResponse(res, 400, "Không tồn tại người dùng");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
module.exports.requestWithdrawal = async function (req, res) {
  let { amount, numberPhone } = req.body;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (user) {
      let admins = await User.find({ role: "Admin" });
      let administrator = new Administrator({
        type: "money",
        status: 0,
        amount: amount,
        numberPhone: numberPhone,
        authorId: userId,
      });
      await administrator.save((err, obj) => {
        notificationController.addNotificationOneUser(
          {
            userId: userId,
            projectId: null,
            authorId: userId,
            administratorId: administrator._id,
            type: "withdrawal-user",
          },
          () => {}
        );
        for (let i = 0; i < admins.length; i++) {
          notificationController.addNotificationOneUser(
            {
              userId: admins[i]._id.toString(),
              projectId: null,
              authorId: userId,
              administratorId: administrator._id,
              type: "withdrawal-admin",
            },
            () => {}
          );
        }
        return handleSuccessResponse(res, 200, {}, "Thành công");
      });
    } else {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */

module.exports.getRequestWithdrawal = async (req, res) => {
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (user) {
      if (user.role !== "Admin") {
        return handleErrorResponse(res, 400, "Không có quyền truy cập");
      }
      let request0 = await Administrator.find({
        type: "money",
        status: 0,
      }).populate({
        path: "authorId",
        select: "_id username avatar role email",
      });
      let request1 = await Administrator.find({
        type: "money",
        status: { $ne: 0 },
      }).populate({
        path: "authorId",
        select: "_id username avatar role email",
      });
      return handleSuccessResponse(
        res,
        200,
        [...request0, ...request1],
        "Thành công"
      );
    } else {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

module.exports.getAllUser = async (req, res) => {
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Phiên đăng nhập kết thúc");
    }
    if (user.role !== "Admin") {
      return handleErrorResponse(res, 400, "Không có quyền truy cập!");
    }
    let allUserAdmin = await User.find({ role: "Admin" }).select(
      "_id avartar role email username isActive"
    );
    let allUsers = await User.find({ role: { $ne: "Admin" } }).select(
      "_id avartar role email username isActive"
    );
    return handleSuccessResponse(
      res,
      200,
      [...allUserAdmin, ...allUsers],
      "Thành công"
    );
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 *
 * @param {*} req memberId, isActive
 * @param {*} res
 * @returns
 */
module.exports.changeIsActive = async (req, res) => {
  let userId = await getCurrentId(req);
  let { memberId, isActive } = req.body;
  try {
    let user = await User.findById(userId);
    if (user.role === "Admin") {
      let member = await User.findById(memberId);
      if (member) {
        member.isActive = isActive;
        member.save(async (err, obj) => {
          if (err) {
            return handleErrorResponse(
              res,
              400,
              "Một lỗi không mong muốn đã xảy ra"
            );
          }
          let allUserAdmin = await User.find({ role: "Admin" }).select(
            "_id avartar role email username isActive"
          );
          let allUsers = await User.find({ role: { $ne: "Admin" } }).select(
            "_id avartar role email username isActive"
          );
          return handleSuccessResponse(
            res,
            200,
            [...allUserAdmin, ...allUsers],
            "Thành công"
          );
        });
      }
    } else {
      return handleErrorResponse(res, 400, "Không có quyền truy cập");
    }
  } catch (error) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
