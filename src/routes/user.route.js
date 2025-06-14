const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { auth, admin } = require("../middlewares/auth.middleware");

// Favorite routes
router.post("/favorite", auth, userController.addFavorite);
router.delete("/favorite", auth, userController.removeFavorite);
router.get("/favorites", auth, userController.getFavorites);
router.get("/favorite/:word", auth, userController.checkFavorite);

// Search history
router.post("/search-history", auth, userController.addSearchHistory);

module.exports = router;
