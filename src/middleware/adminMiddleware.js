const User = require("../model/userModel");

module.exports = async (req, res, next) => {
    let userId = await getCurrentId(req);
    let user = await User.findById(userId);
    if (user.role === "admin") {
        next();
    } else {
        return handleErrorResponse(res, 401, "Bạn không phải là Admin");
    }
};
