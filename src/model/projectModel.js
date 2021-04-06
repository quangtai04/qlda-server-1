const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var projectSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
  },
  { timestamps: true }
);
const Project = mongoose.model("project", projectSchema);

module.exports = Project;
