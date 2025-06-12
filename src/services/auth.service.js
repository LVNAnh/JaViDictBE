const User = require("../models/User");
const { createToken } = require("../utils/jwt");

exports.registerUser = async ({ username, email, password }) => {
  const user = await User.create({ username, email, password });
  const token = createToken(user);
  return { user, token };
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }
  const token = createToken(user);
  return { user, token };
};
