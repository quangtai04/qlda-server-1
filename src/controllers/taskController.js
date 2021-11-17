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
const Section = require("../model/sectionModel");
const sectionController = require("../controllers/sectionController");
const projectController = require("../controllers/projectController");

exports.checkAuthor = async (res, userId, taskId) => {
  let task = await Task.findById(taskId);
  if (!task) {
    return handleErrorResponse(res, 400, "Không tồn tại task");
  }
  if (task.authorId.toString() === userId) {
    return true;
  }
  return false;
};

module.exports.addTask = async (req, res) => {
  //req: {sectionId, projectId, dependencies: [], assignment: [],
  //      name, files , dueDate: {from: Date, to: Date}, isDone, status, priority}
  let userId = await getCurrentId(req);
  let body = req.body;
  try {
    let user = await User.findById(userId);
    let section = await Section.findById(body.sectionId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    if (!section) {
      return handleErrorResponse(res, 400, "Không tồn tại section");
    }
    let task = new Task({
      authorId: userId,
      sectionId: body.sectionId,
      dependenciesTask: body.dependencies,
      assignment: [...body.assignment],
      name: body.name,
      files: [],
      dueDate: body.dueDate,
      isDone: body.isDone !== undefined ? body.isDone : false,
      status: body.status || 0,
      priority: body.priority || 0,
    });
    task.save(async (err, obj) => {
      if (err) {
        return handleErrorResponse(
          res,
          400,
          "Một lỗi không mong muốn đã xảy ra"
        );
      }
      section.tasks.push(task._id);
      section.save(async (err, obj) => {
        if (err) {
          return handleErrorResponse(
            res,
            400,
            "Một lỗi không mong muốn đã xảy ra"
          );
        }
        await Project.findById(req.body.projectId)
          .populate({
            path: "sections",
            populate: [
              {
                path: "tasks",
                populate: {
                  path: "authorId",
                  select: "avatar _id email username",
                },
              },
              {
                path: "authorId",
                select: "avatar _id email username",
              },
            ],
          })
          .then((project) => {
            if (!project) {
              return handleErrorResponse(res, 400, "Không tồn tại project");
            }
            return handleSuccessResponse(
              res,
              200,
              project.sections,
              "Thành công"
            );
          });
      });
    });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

module.exports.getTasks = async (req, res) => {
  // all tasks in project
  // {projectId}
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    await Project.findById(req.query.projectId)
      .populate({
        path: "sections",
        populate: [
          {
            path: "tasks",
            populate: { path: "authorId", select: "avatar _id email username" },
          },
          {
            path: "authorId",
            select: "avatar _id email username",
          },
        ],
      })
      .then((project) => {
        if (!project) {
          return handleErrorResponse(res, 400, "Không tồn tại project");
        }
        return handleSuccessResponse(res, 200, project.sections, "Thành công");
      });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

module.exports.updateTask = async (req, res) => {
  // req: {projectId, taskId, dependencies, assignment: [], name, files, dueDate: {from: Date, to: Date}}
  let userId = await getCurrentId(req);
  let { taskId } = req.body;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    let task = await Task.findById(taskId);
    if (!task) {
      return handleErrorResponse(res, 400, "Không tồn tại task");
    }
    if (req.body.dependencies) {
      task.dependenciesTask = req.body.dependencies;
    }
    if (req.body.assignment) {
      task.assignment = req.body.assignment;
    }
    if (req.body.name) {
      task.name = req.body.name;
    }
    if (req.body.files) {
      task.files = [...req.body.files];
    }
    if (req.body.dueDate) {
      task.dueDate = req.body.dueDate;
    }
    task.save(async (err, obj) => {
      if (err) {
        return handleErrorResponse(
          res,
          400,
          "Một lỗi không mong muốn đã xảy ra"
        );
      }
      return handleSuccessResponse(res, 200, {}, "Thành công");
    });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

exports.deleteTaskById = async (params, deleteInSection, callback) => {
  // params: {taskId}
  let task = await Task.findByIdAndRemove(params.taskId);
  if (task) {
    if (deleteInSection) {
      let section = await Section.findById(task.sectionId);
      section.tasks.splice(section.tasks.indexOf(task._id), 1);
      section.save(async (err, obj, section) => {
        callback(err, obj, section);
      });
    } else {
      callback(false, null, null);
    }
  } else throw Error("Một lỗi không mong muốn đã xảy ra");
};
module.exports.deleteTask = async (req, res) => {
  // req: {taskId, projectId}
  let userId = await getCurrentId(req);
  let { taskId } = req.body;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    if (
      !(await this.checkAuthor(res, userId, taskId)) &&
      !(await projectController.checkAdmin(res, userId, req.body.projectId))
    ) {
      return handleErrorResponse(res, 400, "Bạn không có quyền xóa task");
    }
    this.deleteTaskById({ taskId: taskId }, true, async (err, obj, section) => {
      if (err) {
        return handleErrorResponse(
          res,
          400,
          "Một lỗi không mong muốn đã xảy ra"
        );
      }
      return handleSuccessResponse(res, 200, {}, "Thành công");
    });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
