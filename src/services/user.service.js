const User = require("../models/User");
const Dictionary = require("../models/Dictionary");

exports.addFavoriteWord = async (userId, word) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  if (!word) {
    throw new Error("Từ không hợp lệ");
  }

  const dictionaryWord = await Dictionary.findOne({
    word: word.toLowerCase().trim(),
    status: "active",
  });

  if (!dictionaryWord) {
    throw new Error("Từ không tồn tại trong từ điển");
  }

  if (user.favoriteWords.includes(word)) {
    throw new Error("Từ đã có trong danh sách yêu thích");
  }

  user.favoriteWords.push(word);
  await user.save();

  await dictionaryWord.incrementFavoriteCount();

  return {
    message: "Đã thêm vào yêu thích",
    favoriteWords: user.favoriteWords,
  };
};

exports.removeFavoriteWord = async (userId, word) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  if (!word) {
    throw new Error("Từ không hợp lệ");
  }

  if (!user.favoriteWords.includes(word)) {
    throw new Error("Từ không có trong danh sách yêu thích");
  }

  user.favoriteWords = user.favoriteWords.filter((favWord) => favWord !== word);
  await user.save();

  const dictionaryWord = await Dictionary.findOne({
    word: word.toLowerCase().trim(),
    status: "active",
  });

  if (dictionaryWord) {
    await dictionaryWord.decrementFavoriteCount();
  }

  return {
    message: "Đã xóa khỏi yêu thích",
    favoriteWords: user.favoriteWords,
  };
};

exports.getFavoriteWords = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  const favoriteWordsDetails = await Dictionary.find({
    word: { $in: user.favoriteWords },
    status: "active",
  }).select("-__v");

  return {
    favoriteWords: user.favoriteWords,
    favoriteWordsDetails,
  };
};

exports.checkFavoriteWord = async (userId, word) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  const isFavorite = user.favoriteWords.includes(word);
  return { isFavorite };
};

exports.addToSearchHistory = async (userId, word) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  if (!word) {
    throw new Error("Từ không hợp lệ");
  }

  user.searchHistory.unshift(word);
  user.searchHistory = [...new Set(user.searchHistory)].slice(0, 20);
  await user.save();

  return { searchHistory: user.searchHistory };
};
