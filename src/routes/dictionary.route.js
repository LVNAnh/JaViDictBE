const express = require("express");
const dictionaryController = require("../controllers/dictionary.controller");
const { auth, admin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.get("/", dictionaryController.getWords);
router.get("/search", dictionaryController.searchWords);
router.get("/popular", dictionaryController.getPopularWords);
router.get("/:id", dictionaryController.getWordById);

// Protected routes - yêu cầu đăng nhập
router.post("/", auth, admin, dictionaryController.createWord);
router.put("/:id", auth, admin, dictionaryController.updateWord);
router.delete("/:id", auth, admin, dictionaryController.deleteWord);
router.post("/:id/favorite", auth, dictionaryController.toggleFavorite);

module.exports = router;
