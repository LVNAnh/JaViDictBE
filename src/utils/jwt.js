const jwt = require("jsonwebtoken");

exports.createTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");

  return { accessToken, refreshToken };
};

exports.verifyRefreshToken = async (token, userId) => {
  const User = require("../models/User");
  const user = await User.findById(userId);

  if (!user) return null;

  await user.cleanExpiredRefreshTokens();

  const validToken = user.refreshTokens.find(
    (rt) => rt.token === token && rt.expiresAt > new Date()
  );

  return validToken ? user : null;
};
