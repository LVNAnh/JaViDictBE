const {
  addRoleAndMembershipFields,
  createAdmin,
} = require("./addRoleAndMembership");

const migrations = [
  {
    name: "addRoleAndMembership",
    description: "Thêm role và membership fields cho User model",
    run: addRoleAndMembershipFields,
  },
];

const runAllMigrations = async () => {
  console.log("🚀 Bắt đầu chạy tất cả migrations...");

  for (const migration of migrations) {
    try {
      console.log(`\n📦 Chạy migration: ${migration.name}`);
      console.log(`📝 Mô tả: ${migration.description}`);

      await migration.run();

      console.log(`✅ Migration ${migration.name} hoàn thành!`);
    } catch (error) {
      console.error(`❌ Migration ${migration.name} thất bại:`, error);
      throw error;
    }
  }

  console.log("\n🎉 Tất cả migrations đã hoàn thành!");
};

module.exports = {
  migrations,
  runAllMigrations,
  addRoleAndMembershipFields,
  createAdmin,
};
