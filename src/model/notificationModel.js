const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var notificationSchema = Schema(
  {
    content: { type: String },
    deadline: { type: Date },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
