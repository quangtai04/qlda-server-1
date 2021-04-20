const {
  handleErrorResponse,
  handleSuccessResponse,
  getCurrentId,
} = require("../../helper/responseHelper");
const Post = require("../../model/postModel");
const User = require("../../model/userModel");
const Project = require("../../model/projectModel");
const Comment = require("../../model/commentModel");
const { getListPosts } = require("./projectController");

module.exports.addPost = async (req, res) => {
  let body = req.body;
  let authorId = await getCurrentId(req);
  body.authorId = authorId;
  let { projectId } = req.body;
  try {
    let user = await User.findById(authorId);
    if (user) {
      let project = await Project.findById(projectId);
      // kiểm tra user có join project không
      // if(project.userId != authorId && project.userJoin.indexOf(authorId) == -1) {
      //   return handleErrorResponse(
      //     res,
      //     400,
      //     "ErrorSecurity"
      //   )
      // }
      if (project) {
        var post = new Post(body);
        post.save(async function (err, obj) {
          if (err) return handleErrorResponse(res, 400, null, "Add thất bại!");
          var listPost = await getListPosts(projectId);
          return handleSuccessResponse(
            res,
            200,
            { post: listPost },
            "Add thành công!"
          );
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, 401, "Thất bai!");
  }
};
module.exports.deletePost = async (req, res) => {
  let { postId } = req.body;
  if (postId) {
    let post = await Post.findByIdAndRemove(postId);
    if (!post) return handleErrorResponse(res, 400, "Không tồn tại postID");
    let listComment = await Comment.find({postId: postId});
    for(var i=0; i<listComment.length; i++) {
      await Comment.findByIdAndRemove(listComment[i]._id);
    }
    let projectId = post.projectId.toString();
    let listPost = await getListPosts(projectId);
    return handleSuccessResponse(res, 200, { post: listPost, projectId: projectId }, "Xóa thành công");
  } else {
    return handleErrorResponse(res, 400, "Không tồn tại postID");
  }
};
module.exports.updatePost = async (req, res) => {
  let { postId, content } = req.body;

  let post = await Post.findOneAndUpdate(
    { _id: postId },
    { content: content },
    { new: true }
  );
  let projectId = post.projectId.toString();
  let listPost = await getListPosts(projectId);
  if (!post) return handleErrorResponse(res, 400, "Không tồn tại postId");
  return handleSuccessResponse(res, 200, {post: listPost, projectId: projectId}, "Cập nhật thành công");
};
module.exports.getComments = async (req, res) => {
  let { postId } = req.body;
  let post = await Post.findById(postId);
  if (post) {
    let commentList = await Post.find({ postId: postId });
    return handleSuccessResponse(
      res,
      200,
      { commentList: commentList },
      "Lấy comments thành công!"
    );
  } else return handleErrorResponse(res, 400, "Không tồn tại postID");
};
