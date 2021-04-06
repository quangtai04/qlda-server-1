const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../../helper/responseHelper");
const Comment = require("../../model/commentModel");
const Post = require("../../model/postModel");
const User = require("../../model/userModel");

module.exports.addComment = async (req, res) => {
  let body = req.body;
  let { authorId, postId } = req.body;
  try {
    let user = await User.findById(authorId);
    if (user) {
      try {
        let post = await Post.findById(postId);
        if (post) {
          var comment = new Comment(body);
          comment.save(function (err, obj) {
            if (err)
              return handleErrorResponse(res, 400, null, "Add thất bại!");
            return handleSuccessResponse(
              res,
              200,
              { commentID: comment._id },
              "Add thành công!"
            );
          });
        } else {
          return handleErrorResponse(res, 400, "Không tồn tại postID");
        }
      } catch (error) {
        return handleErrorResponse(res, 401, "Không tìm thấy Post!");
      }
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy User!");
  }
};
module.exports.deleteComment = async (req, res) => {
  let { postId, commentId } = req.body;
  try {
    let post = await Post.findById(postId);
    if (post) {
      let comment = await Comment.findOneAndRemove({ _id: commentId });
      if (!comment)
        return handleErrorResponse(res, 400, "Không tồn tại comment!");
      return handleSuccessResponse(res, 200, null, "Xóa thành công");
    } else {
      return handleErrorResponse(res, 400, "Không tồn tại postID");
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Không tìm thấy Post!");
  }
};
module.exports.updateComment = async (req, res) => {
  let { postId, commentId, content } = req.body;
  let post = await Post.findById(postId);
  if (post) {
    let comment = await Comment.findOneAndUpdate(
      { _id: commentId },
      { content: content },
      { new: true }
    );
    if (!comment)
      return handleErrorResponse(res, 400, "Không tồn tại comment!");
    return handleSuccessResponse(res, 200, null, "Update thành công");
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại postID");
  }
};
