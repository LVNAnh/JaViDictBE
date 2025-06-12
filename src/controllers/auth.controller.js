const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("req.body:", req.body); 
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    res.json({ user, token });
  } catch (err) {
    console.error(err); 
    res.status(401).json({ error: err.message });
  }
};
