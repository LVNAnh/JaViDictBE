const dictionaryService = require("../services/dictionary.service");

class DictionaryController {
  // Tạo từ vựng mới
  async createWord(req, res) {
    try {
      const word = await dictionaryService.createWord(req.body, req.user._id);
      res.status(201).json({
        success: true,
        message: "Tạo từ vựng thành công",
        data: word,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy danh sách từ vựng
  async getWords(req, res) {
    try {
      const { page = 1, limit = 20, language, level, tag } = req.query;
      const filters = {};

      if (language) filters.language = language;
      if (level) filters.level = level;
      if (tag) filters.tags = { $in: [tag] };

      const result = await dictionaryService.getAllWords(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy từ vựng theo ID
  async getWordById(req, res) {
    try {
      const word = await dictionaryService.getWordById(req.params.id);

      if (!word) {
        return res.status(404).json({
          success: false,
          message: "Từ vựng không tồn tại",
        });
      }

      res.json({
        success: true,
        data: word,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Tìm kiếm từ vựng
  async searchWords(req, res) {
    try {
      const { q, language, page = 1, limit = 20 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Thiếu từ khóa tìm kiếm",
        });
      }

      const result = await dictionaryService.searchWords(
        q,
        language,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cập nhật từ vựng
  async updateWord(req, res) {
    try {
      const word = await dictionaryService.updateWord(
        req.params.id,
        req.body,
        req.user._id
      );

      res.json({
        success: true,
        message: "Cập nhật từ vựng thành công",
        data: word,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Xóa từ vựng
  async deleteWord(req, res) {
    try {
      await dictionaryService.deleteWord(req.params.id, req.user._id);

      res.json({
        success: true,
        message: "Xóa từ vựng thành công",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Lấy từ vựng phổ biến
  async getPopularWords(req, res) {
    try {
      const { language, limit = 10 } = req.query;
      const words = await dictionaryService.getPopularWords(
        language,
        parseInt(limit)
      );

      res.json({
        success: true,
        data: words,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Toggle yêu thích
  async toggleFavorite(req, res) {
    try {
      const { action } = req.body; // "add" hoặc "remove"
      const word = await dictionaryService.toggleFavorite(
        req.params.id,
        action
      );

      res.json({
        success: true,
        message: `${action === "add" ? "Thêm" : "Bỏ"} yêu thích thành công`,
        data: word,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new DictionaryController();
