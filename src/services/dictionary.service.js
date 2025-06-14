const Dictionary = require("../models/Dictionary");

class DictionaryService {
  // Tạo từ vựng mới
  async createWord(wordData, userId) {
    const word = new Dictionary({
      ...wordData,
      createdBy: userId,
    });
    return await word.save();
  }

  // Lấy tất cả từ vựng với phân trang
  async getAllWords(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = { status: "active", ...filters };

    const words = await Dictionary.find(query)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    const total = await Dictionary.countDocuments(query);

    return {
      words,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    };
  }

  // Tìm từ vựng theo ID
  async getWordById(id) {
    const word = await Dictionary.findById(id).populate(
      "createdBy",
      "username"
    );

    if (word) {
      await word.incrementSearchCount();
    }

    return word;
  }

  // Tìm kiếm từ vựng
  async searchWords(query, language = null, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    let words;
    let total;

    if (query.trim()) {
      words = await Dictionary.searchWords(query, language)
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "username");

      const searchConditions = {
        $text: { $search: query },
        status: "active",
      };
      if (language) searchConditions.language = language;

      total = await Dictionary.countDocuments(searchConditions);
    } else {
      const filters = language ? { language } : {};
      const result = await this.getAllWords(filters, page, limit);
      return result;
    }

    return {
      words,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    };
  }

  // Cập nhật từ vựng
  async updateWord(id, updateData, userId) {
    const word = await Dictionary.findById(id);

    if (!word) {
      throw new Error("Từ vựng không tồn tại");
    }

    // Kiểm tra quyền sở hữu (chỉ admin hoặc người tạo mới được sửa)
    if (word.createdBy.toString() !== userId) {
      throw new Error("Không có quyền chỉnh sửa từ vựng này");
    }

    Object.assign(word, updateData);
    return await word.save();
  }

  // Xóa từ vựng (soft delete)
  async deleteWord(id, userId) {
    const word = await Dictionary.findById(id);

    if (!word) {
      throw new Error("Từ vựng không tồn tại");
    }

    if (word.createdBy.toString() !== userId) {
      throw new Error("Không có quyền xóa từ vựng này");
    }

    word.status = "inactive";
    return await word.save();
  }

  // Lấy từ vựng theo ngôn ngữ
  async getWordsByLanguage(language, page = 1, limit = 20) {
    return await this.getAllWords({ language }, page, limit);
  }

  // Lấy từ vựng phổ biến
  async getPopularWords(language = null, limit = 10) {
    const query = { status: "active" };
    if (language) query.language = language;

    return await Dictionary.find(query)
      .sort({ searchCount: -1, favoriteCount: -1 })
      .limit(limit)
      .populate("createdBy", "username");
  }

  // Thêm/bỏ yêu thích
  async toggleFavorite(wordId, action) {
    const word = await Dictionary.findById(wordId);
    if (!word) {
      throw new Error("Từ vựng không tồn tại");
    }

    if (action === "add") {
      await word.incrementFavoriteCount();
    } else if (action === "remove") {
      await word.decrementFavoriteCount();
    }

    return word;
  }
}

module.exports = new DictionaryService();
