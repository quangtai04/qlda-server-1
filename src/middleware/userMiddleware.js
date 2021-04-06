const jwt = require("jsonwebtoken");
const {
  handleErrorResponse,
  getCurrentId,
} = require("../helper/responseHelper");
module.exports = async (req, res, next) => {
  let id = await getCurrentId(req);
  if (id === "") {
    return handleErrorResponse(res, 401, "Không thể xác thực người dùng !");
  } else {
    req.id = id;
    next();
  }
};
