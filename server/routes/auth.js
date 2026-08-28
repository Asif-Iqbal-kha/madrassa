const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'صارف نام اور پاسورڈ ضروری ہے' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'صارف نام یا پاسورڈ غلط ہے' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'صارف نام یا پاسورڈ غلط ہے' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'اکاؤنٹ غیر فعال ہے' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Build profile based on role
    let profile = {
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      phone: user.phone,
    };

    // Populate linked profile data
    if (user.role === 'teacher' && user.teacherProfile) {
      const Teacher = require('../models/Teacher');
      const teacherData = await Teacher.findById(user.teacherProfile).populate('classes', 'name');
      if (teacherData) {
        profile.subject = teacherData.subject;
        profile.qualification = teacherData.qualification;
        profile.classes = teacherData.classes || [];
      }
    }

    if (user.role === 'student' && user.studentProfile) {
      const Student = require('../models/Student');
      const studentData = await Student.findById(user.studentProfile);
      if (studentData) {
        profile.rollNumber = studentData.rollNumber;
        profile.fatherName = studentData.fatherName;
        profile.className = studentData.className;
        profile.classId = studentData.class;
        profile.address = studentData.address;
        profile.enrollmentDate = studentData.enrollmentDate;
      }
    }

    res.json({
      success: true,
      token,
      user: profile,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get logged-in user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    let profile = {
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      phone: user.phone,
    };

    if (user.role === 'teacher' && user.teacherProfile) {
      const Teacher = require('../models/Teacher');
      const teacherData = await Teacher.findById(user.teacherProfile).populate('classes', 'name');
      if (teacherData) {
        profile.subject = teacherData.subject;
        profile.qualification = teacherData.qualification;
        profile.classes = teacherData.classes || [];
      }
    }

    if (user.role === 'student' && user.studentProfile) {
      const Student = require('../models/Student');
      const studentData = await Student.findById(user.studentProfile);
      if (studentData) {
        profile.rollNumber = studentData.rollNumber;
        profile.fatherName = studentData.fatherName;
        profile.className = studentData.className;
        profile.classId = studentData.class;
        profile.address = studentData.address;
        profile.enrollmentDate = studentData.enrollmentDate;
      }
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
