const Student = require('../models/Student');

/**
 * Generate the next sequential roll number starting from 1001.
 * Always finds the current highest numeric roll number across ALL students
 * and returns (highest + 1), regardless of how the student is being added.
 *
 * @returns {Promise<string>} The next roll number as a string (e.g. "1001", "1002", ...)
 */
async function generateRollNumber() {
  // Find the student with the highest numeric roll number
  const lastStudent = await Student.findOne(
    { rollNumber: { $regex: /^\d+$/ } }, // only numeric roll numbers
    { rollNumber: 1 }
  )
    .sort({ rollNumber: -1 })
    .collation({ locale: 'en_US', numericOrdering: true })
    .lean();

  if (!lastStudent) {
    return '1001'; // First ever student
  }

  const lastRoll = parseInt(lastStudent.rollNumber, 10);
  if (isNaN(lastRoll) || lastRoll < 1000) {
    return '1001';
  }

  return String(lastRoll + 1);
}

module.exports = generateRollNumber;
