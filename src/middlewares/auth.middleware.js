const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware xác thực cơ bản
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Không có token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ error: "Người dùng không tồn tại" });
    }

    next();
  } catch (err) {
    res
      .status(401)
      .json({ error: "Access token không hợp lệ hoặc đã hết hạn" });
  }
};

// Middleware kiểm tra admin (yêu cầu đã đăng nhập)
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực" });
  }

  if (!req.user.isAdmin()) {
    return res.status(403).json({ error: "Chỉ admin mới có quyền truy cập" });
  }

  next();
};

// Middleware kiểm tra membership (yêu cầu đã đăng nhập)
const membershipMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực" });
  }

  if (!req.user.isValidMembership()) {
    return res.status(403).json({
      error: "Tính năng này yêu cầu membership hợp lệ",
      membership: req.user.membership,
      membershipExpiry: req.user.membershipExpiry,
    });
  }

  next();
};

module.exports = {
  auth: authMiddleware,
  admin: adminMiddleware,
  membership: membershipMiddleware,
};
