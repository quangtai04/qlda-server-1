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

/**
 *
 * @param {projectId, callback: (err: string, data: any) => void} projectId
 * @param {*} callback
 */
exports.getAllTasks = async (projectId, callback) => {
  await Project.findById(projectId)
    .populate({
      path: "sections",
      populate: [
        {
          path: "tasks",
          populate: [
            {
              path: "authorId",
              select: "avatar _id email username",
            },
            {
              path: "dependenciesTask",
              populate: {
                path: "authorId",
                select: "avatar _id email username",
              },
            },
          ],
        },
        {
          path: "authorId",
          select: "avatar _id email username",
        },
      ],
    })
    .then((project) => {
      if (!project) {
        callback("Không tồn tại project", null);
      }
      callback(null, project.sections);
    });
};

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
        this.getAllTasks(req.body.projectId, (err, data) => {
          if (err) {
            return handleErrorResponse(res, 400, err);
          }
          return handleSuccessResponse(res, 200, data, "Thành công");
        });
      });
      // fetch("http://localhost:3003/api/github")
      //   .then((res) => res.json())
      //   .then((json) => {});
    });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
/**
 *
 * @param {query: projectId} req
 * @param {*} res
 * @returns
 */
module.exports.getTasks = async (req, res) => {
  // all tasks in project
  // {projectId}
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    this.getAllTasks(req.query.projectId, (err, data) => {
      if (err) {
        return handleErrorResponse(res, 400, err);
      }
      return handleSuccessResponse(res, 200, data, "Thành công");
    });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 * getTask: req.query: projectId, taskId
 * @param {projectId} req
 * @param {*} res
 * @returns
 */
module.exports.getTask = async (req, res) => {
  let { taskId } = req.query;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại tài khoản");
    }
    await Task.findById(taskId)
      .populate([
        {
          path: "author",
          select: "avatar _id email username",
        },
        {
          path: "dependenciesTask",
          populate: {
            path: "authorId",
            select: "avatar _id email username",
          },
        },
      ])
      .then((task) => {
        return handleSuccessResponse(res, 200, task, "Thành công");
      });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
/**
 * Change task from section_1 to section_2
 * @param { projectId, taskId, sectionId1: old, sectionId2: new , index?: number} req
 * @param {*} res
 * @returns
 */
module.exports.changeSection = async (req, res) => {
  let { taskId, sectionId1, sectionId2, index } = req.body;
  let userId = await getCurrentId(req);
  try {
    if (
      !(await this.checkAuthor(res, userId, taskId)) &&
      !(await projectController.checkAdmin(res, userId, req.body.projectId))
    ) {
      return handleErrorResponse(res, 400, "Bạn không có quyền sửa task");
    }
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Không tồn tại user");
    }
    let task = await Task.findById(taskId);
    if (!task) {
      return handleErrorResponse(res, 400, "Không tồn tại task");
    }
    let section1 = await Section.findById(sectionId1);
    let section2 = await Section.findById(sectionId2);
    if (!section1 || !section2) {
      return handleErrorResponse("Không tồn tại section");
    }
    if (section1.tasks.indexOf(taskId) === -1) {
      return handleErrorResponse(res, 400, "Không tồn tại task trong section");
    }
    task.sectionId = sectionId2;
    await task.save();
    section1.tasks.splice(section1.tasks.indexOf(taskId), 1);
    await section1.save();
    if (index) {
      section1.tasks = [
        section2.tasks.splice(0, index),
        taskId,
        section2.splice(index),
      ];
    } else {
      section2.tasks.push(taskId);
    }
    await section2.save((err, obj) => {
      if (err)
        return handleErrorResponse(
          res,
          400,
          "Một lỗi không mong muốn đã xảy ra"
        );
      this.getAllTasks(req.body.projectId, (err, data) => {
        if (err) {
          return handleErrorResponse(res, 400, err);
        }
        return handleSuccessResponse(res, 200, data, "Thành công");
      });
    });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 *
 * @param {projectId, taskId, dependencies?, assignment?: String[], name?, files?,
 *        dueDate?: {from: Date, to: Date}, isDone?: boolean, status?, priority?} req
 * @param {*} res
 * @returns
 */
module.exports.updateTask = async (req, res) => {
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
      return handleErrorResponse(res, 400, "Bạn không có quyền sửa task");
    }
    let task = await Task.findById(taskId);
    if (!task) {
      return handleErrorResponse(res, 400, "Không tồn tại task");
    }
    if (req.body.dependencies !== undefined)
      task.dependenciesTask = req.body.dependencies;
    if (req.body.assignment) task.assignment = req.body.assignment;
    if (req.body.name) task.name = req.body.name;
    if (req.body.files) task.files = [...req.body.files];
    if (req.body.dueDate) task.dueDate = req.body.dueDate;
    if (req.body.isDone) task.isDone = req.body.isDone;
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.status) task.body.status = req.body.status;
    task.save(async (err, obj) => {
      if (err) {
        return handleErrorResponse(
          res,
          400,
          "Một lỗi không mong muốn đã xảy ra"
        );
      }
      this.getAllTasks(req.body.projectId, (err, data) => {
        if (err) {
          return handleErrorResponse(res, 400, err);
        }
        return handleSuccessResponse(res, 200, data, "Thành công");
      });
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
