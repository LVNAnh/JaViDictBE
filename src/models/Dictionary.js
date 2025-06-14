const mongoose = require("mongoose");

const dictionarySchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    language: {
      type: String,
      enum: ["ja", "vi"],
      required: true,
      index: true,
    },

    pronunciation: {
      type: String,
      trim: true,
    },

    romaji: {
      type: String,
      trim: true,
    },

    meanings: [
      {
        definition: { type: String, required: true, trim: true },
        partOfSpeech: {
          type: String,
          enum: [
            "noun",
            "verb",
            "adjective",
            "adverb",
            "particle",
            "conjunction",
            "interjection",
            "pronoun",
            "other",
          ],
          default: "other",
        },
        examples: [
          {
            sentence: { type: String, trim: true },
            translation: { type: String, trim: true },
          },
        ],
      },
    ],

    level: {
      type: String,
      enum: ["N5", "N4", "N3", "N2", "N1", "basic", "intermediate", "advanced"],
      default: "basic",
    },

    tags: [String],

    frequency: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    kanji: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "pending", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    searchCount: {
      type: Number,
      default: 0,
    },

    favoriteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      { word: 1, language: 1 },
      { word: "text", "meanings.definition": "text" },
    ],
  }
);

dictionarySchema.index({
  word: "text",
  pronunciation: "text",
  romaji: "text",
  "meanings.definition": "text",
});

dictionarySchema.methods.incrementSearchCount = function () {
  this.searchCount += 1;
  return this.save();
};

dictionarySchema.methods.incrementFavoriteCount = function () {
  this.favoriteCount += 1;
  return this.save();
};

dictionarySchema.methods.decrementFavoriteCount = function () {
  if (this.favoriteCount > 0) {
    this.favoriteCount -= 1;
  }
  return this.save();
};

dictionarySchema.statics.findByLanguage = function (language) {
  return this.find({ language, status: "active" });
};

dictionarySchema.statics.searchWords = function (query, language = null) {
  const searchConditions = {
    $text: { $search: query },
    status: "active",
  };

  if (language) {
    searchConditions.language = language;
  }

  return this.find(searchConditions, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
  });
};

module.exports = mongoose.model("Dictionary", dictionarySchema);
