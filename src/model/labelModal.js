const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var labelSchema = Schema(
  {
    color: { type: String, default: "#12b300" },
    name: { type: String, default: "new label" },
    descripton: { type: String, default: "" },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const Label = mongoose.model("Label", labelSchema);

module.exports = Label;
