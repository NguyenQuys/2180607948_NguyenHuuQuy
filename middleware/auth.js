const jwt = require("jsonwebtoken");
const constants = require("../utils/constants");
const userSchema = require("../schemas/user");

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Lấy token từ header
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Không tìm thấy token",
        });
      }

      // Verify token
      const decoded = jwt.verify(token, constants.SECRET_KEY);

      // Lấy thông tin user từ database
      const user = await userSchema.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User không tồn tại",
        });
      }

      // Kiểm tra quyền
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập",
        });
      }

      // Lưu thông tin user vào request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
  };
};

module.exports = {
  checkRole,
};
