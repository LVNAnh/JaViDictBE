const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin()) {
    return res.status(403).json({ error: "Chỉ admin mới có quyền truy cập" });
  }
  next();
};

module.exports = adminMiddleware;
