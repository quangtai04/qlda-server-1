const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var administratorSchema = Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String }, // blog | video | money
    status: { type: Number }, // -1: refuse; 0: undecided; 1: agree
    amount: { type: Number },
    numberPhone: { type: String },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog" },
    videoId: { type: Schema.Types.ObjectId, ref: "Video" },
  },
  { timestamps: true }
);
const Administrator = mongoose.model("Administrator", administratorSchema);
module.exports = Administrator;
