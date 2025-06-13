const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(
      req.body
    );
    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
    });
    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id || req.body.userId;

    const tokens = await authService.refreshToken({ refreshToken, userId });
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.id;

    const result = await authService.logout({ refreshToken, userId });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
