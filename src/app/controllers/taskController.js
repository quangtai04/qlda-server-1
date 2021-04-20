const {
    handleErrorResponse,
    handleSuccessResponse,
    getCurrentId,
  } = require("../../helper/responseHelper");
  const Project = require("../../model/projectModel");
  const Post = require("../../model/postModel");
  const User = require("../../model/userModel");
  const Comment = require("../../model/commentModel");
  const Task = require("../../model/taskModel");
  const { use } = require("../../routers/usersRouter");
  const { getNameAndAvatar } = require("./userController");
  module.exports.addTask = async (req, res) => {
    let userId = await getCurrentId(req);
    let body = req.body;   //{projectId, name, desc, typeTask, assignment}
    body.authorId = userId;
    try {
        let user = await User.findById(userId);
        if(!user) {
            return handleErrorResponse(
                res,
                400,
                "Không tồn tại user"
            )
        }
        let task = new Task(body);
        task.save(async function(err, obj) {
            let listTask = await Task.find({projectId: body.projectId});
            if(err) {
                return handleErrorResponse(
                    res,
                    400,
                    "ErrorAddTask"
                );
            }
            return handleSuccessResponse(
                res,
                200,
                listTask,
                "AddTaskComplete"
            )
        });
    } catch (error) {
        return handleErrorResponse(
            res,
            400,
            "Error"
        )
    }
  }
  module.exports.getTask = async (req, res) => {
      let {projectId} = req.body;
      let listTask = await Task.find({projectId: projectId});
      return handleSuccessResponse(
          res,
          200,
          listTask,
          "Thành công"
      )
  }
  module.exports.updateTask = async (req, res) => {   //req: {id, projectId, assignment, typeTask, taskname, desc}
    let {id, projectId, assignment, typeTask, taskname, desc} = req.body;
    let task = await Task.findOneAndUpdate(
        {_id: id},
        {
        assignment: assignment,
        typeTask: typeTask,
        taskname: taskname,
        desc: desc
        },
        {new: true}
    );
    if(!task) {
        return handleErrorResponse(
            res,
            400,
            "Không tồn tại task"
        )
    }
    let listTask = await Task.find({projectId: projectId});
    return handleSuccessResponse(
        res,
        200,
        listTask,
        "UpdateCompleted"
    )
  }
  module.exports.deleteTask = async (req, res) => { //req: {id, projectId}
    let {id, projectId} = req.body;
    let query = await Task.findByIdAndRemove(id);
    if(!query) {
        return handleErrorResponse(
            res,
            400,
            "ErrorDelete"
        );
    }
    let listTask = await Task.find({projectId: projectId});
    return handleSuccessResponse(
        res,
        200,
        listTask,
        "UpdateCompleted"
    )
  }