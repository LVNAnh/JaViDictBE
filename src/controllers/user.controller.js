const userService = require("../services/user.service");

exports.addFavorite = async (req, res) => {
  try {
    const { word } = req.body;
    const userId = req.user._id;

    const result = await userService.addFavoriteWord(userId, word);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { word } = req.body;
    const userId = req.user._id;

    const result = await userService.removeFavoriteWord(userId, word);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await userService.getFavoriteWords(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const { word } = req.params;
    const userId = req.user._id;

    const result = await userService.checkFavoriteWord(userId, word);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addSearchHistory = async (req, res) => {
  try {
    const { word } = req.body;
    const userId = req.user._id;

    const result = await userService.addToSearchHistory(userId, word);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
