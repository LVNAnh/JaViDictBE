const User = require("../models/User");

exports.addFavorite = async (req, res) => {
  const { word } = req.body;
  const user = req.user;

  if (!word) return res.status(400).json({ error: "Từ không hợp lệ" });

  if (!user.favoriteWords.includes(word)) {
    user.favoriteWords.push(word);
    await user.save();
  }

  res.json({ favoriteWords: user.favoriteWords });
};

exports.addSearchHistory = async (req, res) => {
  const { word } = req.body;
  const user = req.user;

  if (!word) return res.status(400).json({ error: "Từ không hợp lệ" });

  user.searchHistory.unshift(word); 
  user.searchHistory = [...new Set(user.searchHistory)].slice(0, 20); 
  await user.save();

  res.json({ searchHistory: user.searchHistory });
};
