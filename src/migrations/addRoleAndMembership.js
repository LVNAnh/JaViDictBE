const mongoose = require("mongoose");
const User = require("../models/User");

const addRoleAndMembershipFields = async () => {
  try {
    console.log("Bắt đầu migration: Thêm role và membership fields...");

    // Chỉ cập nhật những users chưa có các trường mới
    const updateOperations = [];

    // Tìm users chưa có trường role và set mặc định là 1 (user)
    const usersWithoutRole = await User.updateMany(
      { role: { $exists: false } }, // Chỉ những document chưa có trường role
      { $set: { role: 1 } }
    );

    // Tìm users chưa có trường membership và set mặc định là "none"
    const usersWithoutMembership = await User.updateMany(
      { membership: { $exists: false } }, // Chỉ những document chưa có trường membership
      { $set: { membership: "none" } }
    );

    // Tìm users chưa có trường membershipExpiry và set mặc định là null
    const usersWithoutExpiry = await User.updateMany(
      { membershipExpiry: { $exists: false } }, // Chỉ những document chưa có trường membershipExpiry
      { $set: { membershipExpiry: null } }
    );

    console.log(`✅ Migration hoàn thành!`);
    console.log(
      `   - Đã thêm role cho ${usersWithoutRole.modifiedCount} users`
    );
    console.log(
      `   - Đã thêm membership cho ${usersWithoutMembership.modifiedCount} users`
    );
    console.log(
      `   - Đã thêm membershipExpiry cho ${usersWithoutExpiry.modifiedCount} users`
    );

    // Hiển thị thống kê sau migration
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 0 });
    const regularUsers = await User.countDocuments({ role: 1 });
    const membershipStats = await User.aggregate([
      {
        $group: {
          _id: "$membership",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("\n📊 Thống kê sau migration:");
    console.log(`   - Tổng số users: ${totalUsers}`);
    console.log(`   - Admin users: ${adminUsers}`);
    console.log(`   - Regular users: ${regularUsers}`);
    console.log("   - Phân bố membership:");
    membershipStats.forEach((stat) => {
      console.log(`     * ${stat._id}: ${stat.count} users`);
    });

    return {
      roleUpdated: usersWithoutRole.modifiedCount,
      membershipUpdated: usersWithoutMembership.modifiedCount,
      expiryUpdated: usersWithoutExpiry.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Lỗi trong quá trình migration:", error);
    throw error;
  }
};

// Tạo admin user
const createAdmin = async (adminData = {}) => {
  try {
    const adminUser = await User.create({
      role: 0,
      membership: "lifetime",
      membershipExpiry: null,
      ...adminData,
    });

    console.log("✅ Đã tạo admin user:", adminUser.username);
    return adminUser;
  } catch (error) {
    if (error.code === 11000) {
      console.log("⚠️  Admin với thông tin này đã tồn tại trong database!");
      return null; // Hoặc throw custom error
    }

    console.error("❌ Lỗi khi tạo admin:", error.message);
    throw error;
  }
};

// Function để kiểm tra và sửa chữa dữ liệu không nhất quán
const fixInconsistentData = async () => {
  try {
    console.log("🔧 Kiểm tra và sửa chữa dữ liệu không nhất quán...");

    // Tìm users có membership nhưng không có expiry date (trừ lifetime)
    const usersNeedExpiry = await User.find({
      membership: { $in: ["monthly", "yearly"] },
      $or: [
        { membershipExpiry: null },
        { membershipExpiry: { $exists: false } },
      ],
    });

    for (const user of usersNeedExpiry) {
      const now = new Date();
      let expiryDate;

      if (user.membership === "monthly") {
        expiryDate = new Date(now.setMonth(now.getMonth() + 1));
      } else if (user.membership === "yearly") {
        expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
      }

      if (expiryDate) {
        await User.findByIdAndUpdate(user._id, {
          membershipExpiry: expiryDate,
        });
        console.log(
          `   - Đã cập nhật expiry cho user ${
            user.username
          }: ${expiryDate.toISOString()}`
        );
      }
    }

    console.log(`✅ Đã kiểm tra và sửa chữa ${usersNeedExpiry.length} users`);
  } catch (error) {
    console.error("❌ Lỗi khi sửa chữa dữ liệu:", error);
    throw error;
  }
};

const rollbackMigration = async () => {
  try {
    console.log("🔄 Bắt đầu rollback migration...");

    // Xóa các trường đã thêm (cẩn thận với việc này!)
    const result = await User.updateMany(
      {},
      {
        $unset: {
          role: "",
          membership: "",
          membershipExpiry: "",
        },
      }
    );

    console.log(
      `✅ Rollback hoàn thành! Đã xóa fields từ ${result.modifiedCount} users.`
    );
    return result;
  } catch (error) {
    console.error("❌ Lỗi trong quá trình rollback:", error);
    throw error;
  }
};

// Export các functions để có thể gọi từ bên ngoài
module.exports = {
  addRoleAndMembershipFields,
  createAdmin,
  fixInconsistentData,
  rollbackMigration,
};

// Nếu file được chạy trực tiếp
if (require.main === module) {
  require("dotenv").config();
  const connectDB = require("../config/db");

  const runMigration = async () => {
    try {
      await connectDB();

      // Chạy migration chính (chỉ thêm trường chưa có)
      await addRoleAndMembershipFields();

      // Sửa chữa dữ liệu không nhất quán
      await fixInconsistentData();

      // Tạo admin user đầu tiên nếu chưa có
      await createAdmin({
        username: "admin2",
        email: "lvnanh150397@gmail.com",
        password: "12345678",
      });

      console.log("\n🎉 Migration hoàn tất!");
      process.exit(0);
    } catch (error) {
      console.error("💥 Migration thất bại:", error);
      process.exit(1);
    }
  };

  runMigration();
}
