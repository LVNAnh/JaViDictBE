const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/favorite", auth, userController.addFavorite);
router.post("/search-history", auth, userController.addSearchHistory);

module.exports = router;
