const membershipMiddleware = (req, res, next) => {
  if (!req.user.isValidMembership()) {
    return res.status(403).json({
      error: "Tính năng này yêu cầu membership hợp lệ",
      membership: req.user.membership,
      membershipExpiry: req.user.membershipExpiry,
    });
  }
  next();
};

module.exports = membershipMiddleware;
