const Video = require("../model/videoModel");
const Project = require("../model/projectModel");
const {
    handleErrorResponse,
    handleSuccessResponse,
    getCurrentId,
} = require("../helper/responseHelper");
const User = require("../model/userModel");
const Administrator = require("../model/administratorModel");
module.exports.getAllContentApprove = async function (req, res) {
    let blogArray = [];
    let videoArray = [];
    let withdrawalArray = [];
    let administrator = await Administrator.find({});
    await Promise.all(
        administrator.map(async (element) => {
            if (element.type === "blog") {
                let blog = await Blog.findById(element.blogId).populate([
                    {
                        path: "authorId",
                        select: "avatar username role email _id",
                    },
                ]);
                blogArray.push(blog);
            } else if (element.type === "video") {
                let video = await Video.findById(element.videoId).populate([
                    {
                        path: "authorId",
                        select: "avatar username role email _id",
                    },
                ]);
                videoArray.push(video);
            }
            else if (element.type === "money") {
                withdrawalArray.push(element)
            }
        })
    );
    return handleSuccessResponse(
        res,
        200,
        { blogArray: blogArray, videoArray: videoArray, withdrawalArray: withdrawalArray },
        "Thành công"
    );
};
module.exports.requestWithdrawalArray = async function (req, res) {
    let { amount } = req.blog
    let administrator = new Administrator({
        type: 'money',
        status: false,
        amount: amount,
        authorId: user,
    })
    await administrator.save();
    return handleSuccessResponse(
        res,
        200,
        {},
        "Thành công"
    );
};
