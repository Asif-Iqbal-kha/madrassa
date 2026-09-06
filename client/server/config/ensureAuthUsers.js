const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Ensures that Admin and Teacher accounts exist and reflect the secure
 * credentials specified in .env.
 * 
 * Removes any student accounts and removes legacy hardcoded names like "مولانا عبدالرحمٰن".
 */
async function ensureAuthUsers() {
  try {
    const adminUsername = (process.env.ADMIN_USERNAME || 'admin_sadeeq').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Sadeeq@Admin2026!';
    const adminName = process.env.ADMIN_NAME || 'ایڈمن (مدیرِ اعلیٰ)';

    const teacherUsername = (process.env.TEACHER_USERNAME || 'teacher_sadeeq').trim().toLowerCase();
    const teacherPassword = process.env.TEACHER_PASSWORD || 'Sadeeq@Teacher2026!';
    const teacherName = process.env.TEACHER_NAME || 'استاذ';

    // 1. Remove any legacy student users
    const deletedStudents = await User.deleteMany({ role: 'student' });
    if (deletedStudents.deletedCount > 0) {
      console.log(`  ✓ Removed ${deletedStudents.deletedCount} student login account(s)`);
    }

    // 2. Ensure Master Admin account
    let admin = await User.findOne({ role: 'master_admin' });

    if (admin) {
      admin.name = adminName;
      admin.username = adminUsername;
      admin.password = adminPassword;
      admin.isActive = true;
      await admin.save();
      console.log(`  ✓ Admin account synced: "${adminUsername}"`);
    } else {
      // Check if username collision with another role
      await User.deleteMany({ username: adminUsername });
      admin = new User({
        name: adminName,
        username: adminUsername,
        password: adminPassword, // pre-save hook will hash it
        role: 'master_admin',
        isActive: true,
      });
      await admin.save();
      console.log(`  ✓ Admin account created: "${adminUsername}"`);
    }

    // 3. Ensure Teacher account (generic, secure, not tied to any individual)
    let teacher = await User.findOne({ role: 'teacher' });

    if (teacher) {
      teacher.name = teacherName;
      teacher.username = teacherUsername;
      teacher.password = teacherPassword;
      teacher.isActive = true;
      await teacher.save();
      console.log(`  ✓ Teacher account synced: "${teacherUsername}"`);
    } else {
      await User.deleteMany({ username: teacherUsername });
      teacher = new User({
        name: teacherName,
        username: teacherUsername,
        password: teacherPassword, // pre-save hook will hash it
        role: 'teacher',
        isActive: true,
      });
      await teacher.save();
      console.log(`  ✓ Teacher account created: "${teacherUsername}"`);
    }

    // Clean up any remaining legacy accounts that don't match configured admin/teacher
    await User.deleteMany({
      role: { $nin: ['master_admin', 'teacher'] },
    });

    return {
      admin: { username: adminUsername, name: adminName },
      teacher: { username: teacherUsername, name: teacherName },
    };
  } catch (error) {
    console.error('⚠️ ensureAuthUsers error:', error.message);
  }
}

module.exports = ensureAuthUsers;
