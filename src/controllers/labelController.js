const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../helper/responseHelper");
const Label = require("../model/labelModal");
const Project = require("../model/projectModel");
const User = require("../model/userModel");

/**
 * add new label
 * @param {*} projectId string
 * @param {*} name string
 * @param {*} color string
 * @param {*} description string
 * @param {*} authorId string
 * @param {*} callback (err, label) => void
 */
module.exports.addLabelOne = async (
  projectId,
  name,
  color,
  description,
  authorId,
  callback
) => {
  let project = await Project.findById(projectId);
  let label = new Label({
    color: color || "#12b300",
    name: name,
    description: description,
    authorId: authorId,
  });
  label.save(async (err, obj) => {
    if (err) {
      callback("Một lỗi không mong muốn đã xảy ra", null);
    }
    project.labels.push(label._id);
    project.save(async (err, obj) => {
      if (err) {
        callback("Một lỗi không mong muốn đã xảy ra", null);
      }
      callback(null, label);
    });
  });
};
/**
 * return lable
 * @param {*} req projectId, labelId
 * @param {*} res
 */
module.exports.getLabel = async (req, res) => {
  let userId = await getCurrentId(req);
  let { projectId, labelId } = req.body;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
    }
    let label = await Label.findById(labelId).populate({
      path: "authorId",
      select: "_id email username avatar role",
    });
    if (!label) {
      return handleErrorResponse(res, 400, "Lỗi lấy dữ liệu");
    }
    return handleSuccessResponse(res, 200, label, "Thành công");
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};

/**
 *
 * @param {*} req projectId, color: string, name: string, description: string
 * @param {*} res
 */
module.exports.addLabel = async (req, res) => {
  let { projectId, color, name, description } = req.body;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
    }
    this.addLabelOne(
      projectId,
      name,
      color,
      description,
      userId,
      (err, label) => {
        if (err) {
          return handleErrorResponse(res, 400, err);
        }
        return handleSuccessResponse(res, 200, label, "Thành công");
      }
    );
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
/**
 * edit label
 * @param {*} req   projectId, labelId, color, name, description
 * @param {*} res
 * @returns
 */
module.exports.updateLabel = async (req, res) => {
  let { labelId, color, name, description } = req.body;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
    }
    let label = await Label.findById(labelId);
    label.name = name;
    label.description = description;
    if (color) {
      label.color = color;
    }
    label.save((err, obj) => {
      if (err) {
        return handleErrorResponse(
          res,
          400,
          "Một lỗi không mong muốn đã xảy ra"
        );
      }
      return handleSuccessResponse(res, 200, label, "Thành công");
    });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
/**
 * delete Label
 * @param {*} req   projectId, labelId
 * @param {*} res
 */
module.exports.deleteLabel = async (req, res) => {
  let { labelId, projectId } = req.body;
  let userId = await getCurrentId(req);
  try {
    let user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 400, "Phiên đăng nhập đã kết thúc");
    }
    let label = await Label.findById(labelId);
    if (!label) {
      return handleErrorResponse(res, 400, "Không tồn tại label");
    }
    if (label.authorId !== userId) {
      return handleErrorResponse(res, 400, "Không có quyền xóa label");
    }
    await Label.findByIdAndRemove(labelId);
    let project = await Project.findById(projectId).populate({
      path: "sections",
      populate: "tasks",
    });
    project.labels.splice(project.labels.indexOf(labelId), 1);
    project.sections.forEach((section) => {
      section.tasks.forEach((task) => {
        if (task.labels.includes(label._id)) {
          task.labels.splice(task.labels.indexOf(label._id), 1);
        }
      });
    });
    project.save((err, obj) => {
      if (err) {
        return handleErrorResponse(
          res,
          400,
          "Một lỗi không mong muốn đã xảy ra"
        );
      }
      return handleSuccessResponse(res, 200, project, "Thành công");
    });
  } catch (err) {
    return handleErrorResponse(res, 400, "Một lỗi không mong muốn đã xảy ra");
  }
};
