const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: Number, enum: [0, 1], default: 1 },
    membership: {
      type: String,
      enum: ["none", "monthly", "yearly", "lifetime"],
      default: "none",
    },
    membershipExpiry: { type: Date, default: null },
    favoriteWords: [String],
    searchHistory: [String],
    preferredLanguage: { type: String, enum: ["ja", "vi"], default: "vi" },
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.addRefreshToken = function (token) {
  const expiresAt = new Date();
  const expiresInDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 7;
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  this.refreshTokens.push({ token, expiresAt });

  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  return this.save();
};

userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
  return this.save();
};

userSchema.methods.cleanExpiredRefreshTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.expiresAt > now);
  return this.save();
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") && !this.isModified("membership"))
    return next();

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified("membership")) {
    const now = new Date();
    switch (this.membership) {
      case "monthly":
        this.membershipExpiry = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case "yearly":
        this.membershipExpiry = new Date(
          now.setFullYear(now.getFullYear() + 1)
        );
        break;
      case "lifetime":
        this.membershipExpiry = null;
        break;
      case "none":
      default:
        this.membershipExpiry = null;
        break;
    }
  }

  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isValidMembership = function () {
  if (this.membership === "lifetime") return true;
  if (this.membership === "none") return false;
  if (!this.membershipExpiry) return false;
  return new Date() < this.membershipExpiry;
};

userSchema.methods.isAdmin = function () {
  return this.role === 0;
};

module.exports = mongoose.model("User", userSchema);
