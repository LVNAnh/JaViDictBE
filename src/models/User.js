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
  },
  { timestamps: true }
);

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
