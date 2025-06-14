const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const dictionaryRoutes = require("./routes/dictionary.route");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dictionary", dictionaryRoutes);

module.exports = app;
