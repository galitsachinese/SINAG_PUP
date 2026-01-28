/* eslint-env node */
const bcrypt = require('bcryptjs');

/**
 * Seed default admin/coordinator account
 * Runs on app startup to ensure admin exists
 */
async function seedAdminUser(db) {
  try {
    const { User } = db;

    // Delete existing admin if it exists (to fix corrupted data)
    await User.destroy({
      where: { email: 'superadmin@gmail.com' },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash('Coordinator_2026', 10);

    // Create fresh admin user (store email in lowercase for query matching)
    const adminUser = await User.create({
      email: 'superadmin@gmail.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'Coordinator',
      mi: '',
    });

    console.log('✅ Admin coordinator account created successfully');
    console.log('   Email: superadmin@gmail.com');
    console.log('   Password: Coordinator_2026');
    console.log('   Role: Coordinator');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    // Don't crash the app if seeding fails
  }
}

module.exports = seedAdminUser;
