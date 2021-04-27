const mongoose = require("mongoose");
const {
    handleErrorResponse,
    handleSuccessResponse,
    getCurrentId,
  } = require("../helper/responseHelper");
var Schema = mongoose.Schema;

var taskSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    assignment: {type: Array},
    typeTask: {type: String, default: "Planned"},    
    taskname: {type: String, default: "New Task"},
    desc: {type: String, default: "This is new task"},
    deadline: {type: Date}
  },
  { timestamps: true }
);
const Task = mongoose.model("task", taskSchema);
module.exports = Task;
