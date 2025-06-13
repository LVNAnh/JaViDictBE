const User = require("../models/User");
const { createTokens } = require("../utils/jwt");

exports.registerUser = async ({ username, email, password }) => {
  const user = await User.create({ username, email, password });
  const { accessToken, refreshToken } = createTokens(user);

  await user.addRefreshToken(refreshToken);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const { accessToken, refreshToken } = createTokens(user);
  await user.addRefreshToken(refreshToken);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

exports.refreshToken = async ({ refreshToken, userId }) => {
  const { verifyRefreshToken } = require("../utils/jwt");
  const user = await verifyRefreshToken(refreshToken, userId);

  if (!user) {
    throw new Error("Refresh token không hợp lệ");
  }

  const { accessToken, refreshToken: newRefreshToken } = createTokens(user);

  await user.removeRefreshToken(refreshToken);
  await user.addRefreshToken(newRefreshToken);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

exports.logout = async ({ refreshToken, userId }) => {
  const User = require("../models/User");
  const user = await User.findById(userId);

  if (user && refreshToken) {
    await user.removeRefreshToken(refreshToken);
  }

  return { message: "Đăng xuất thành công" };
};
