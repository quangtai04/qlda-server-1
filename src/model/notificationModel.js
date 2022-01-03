const mongoose = require("mongoose");
var Schema = mongoose.Schema;

/**
 * content, deadline: {from, to}, type: ["task", "post"], authorId
 */
var notificationSchema = Schema(
  {
    content: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, default: "add-assingment" },
    // content, add-assingment, del-assingment, new-chat, project-invite, project-refuse, project-agree, project-refuse-invited, project-agree-invited
    // add-blog, add-blog-agree, add-blog-refuse, withdrawal-user, withdrawal-admin-agree, withdrawal-admin-refuse, withdrawal-admin
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", default: null },
    administratorId: {
      type: Schema.Types.ObjectId,
      ref: "Administrator",
      default: null,
    },
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
