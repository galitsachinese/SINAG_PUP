/* eslint-env node */
const bcrypt = require('bcryptjs');

/**
 * Seed default admin/coordinator account
 * Runs on app startup to ensure admin exists
 */
async function seedAdminUser(db) {
  try {
    const { User } = db;

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: 'SuperAdmin@gmail.com' },
    });

    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Coordinator_2026', 10);

    // Create admin user
    const adminUser = await User.create({
      email: 'SuperAdmin@gmail.com',
      password: hashedPassword,
      first_name: 'Super',
      last_name: 'Admin',
      role: 'coordinator', // ✅ Coordinator role
      is_password_changed: true, // Don't force password change
    });

    console.log('✅ Admin coordinator account created successfully');
    console.log('   Email: SuperAdmin@gmail.com');
    console.log('   Password: Coordinator_2026');
    console.log('   Role: Coordinator');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    // Don't crash the app if seeding fails
  }
}

module.exports = seedAdminUser;
