const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Checks if an index specification already exists in the collection's index list.
 * Compares key fields and their directional values (1 / -1).
 */
function indexExists(existingIndexes, targetKeySpec) {
  const targetKeys = Object.keys(targetKeySpec);

  return existingIndexes.some((idx) => {
    if (!idx.key) return false;
    const existingKeys = Object.keys(idx.key);
    if (existingKeys.length !== targetKeys.length) return false;
    return targetKeys.every(
      (k) => existingKeys.includes(k) && idx.key[k] === targetKeySpec[k]
    );
  });
}

// Target indexes designed specifically for madrassa queries without unnecessary overhead
const TARGET_INDEX_PLANS = [
  {
    collectionName: 'students',
    model: Student,
    displayName: 'طلباء (Students)',
    indexes: [
      {
        key: { rollNumber: 1 },
        name: 'idx_rollNumber_asc',
        description: 'رول نمبر کی ترتیب و تلاش (Roll Number Ascending & Lookup)',
        options: { background: true },
      },
      {
        key: { status: 1, rollNumber: 1 },
        name: 'idx_status_rollNumber',
        description: 'کیفیت (فعال/فارغین) اور رول نمبر کے ساتھ فہرست (Status & Roll Number Filter + Sort)',
        options: { background: true },
      },
      {
        key: { className: 1, status: 1 },
        name: 'idx_className_status',
        description: 'درجہ کے مطابق فلٹر اور جائزہ (Class Name & Status Filter)',
        options: { background: true },
      },
      {
        key: { phone: 1 },
        name: 'idx_phone_search',
        description: 'رابطہ فون نمبر سے تلاش (Phone Lookup)',
        options: { background: true },
      },
      {
        key: { cnic: 1 },
        name: 'idx_cnic_search',
        description: 'قومی شناختی کارڈ / ب فارم سے تلاش (CNIC / B-Form Lookup)',
        options: { background: true },
      },
      {
        key: { guardianPhone: 1 },
        name: 'idx_guardianPhone_search',
        description: 'سرپرست کے فون سے تلاش (Guardian Phone Lookup)',
        options: { background: true },
      },
    ],
  },
  {
    collectionName: 'classes',
    model: Class,
    displayName: 'درجات (Classes)',
    indexes: [
      {
        key: { name: 1 },
        name: 'idx_class_name',
        description: 'درجہ نام کی ترتیب و تلاش (Class Name Lookup)',
        options: { background: true },
      },
      {
        key: { isActive: 1 },
        name: 'idx_class_active',
        description: 'فعال درجات فلٹر (Active Classes)',
        options: { background: true },
      },
    ],
  },
  {
    collectionName: 'attendances',
    model: Attendance,
    displayName: 'حاضری رجسٹر (Attendance)',
    indexes: [
      {
        key: { date: -1 },
        name: 'idx_attendance_date_desc',
        description: 'حالیہ یومیہ حاضری تلاش (Recent Attendance Date)',
        options: { background: true },
      },
    ],
  },
];

// @route   GET /api/database/status
// @desc    Inspect current indexes across collections
// @access  Admin only
router.get('/status', protect, authorize('master_admin'), async (req, res) => {
  try {
    const report = [];

    for (const plan of TARGET_INDEX_PLANS) {
      let existing = [];
      try {
        existing = await plan.model.collection.indexes();
      } catch (e) {
        existing = [];
      }

      const indexDetails = plan.indexes.map((target) => {
        const exists = indexExists(existing, target.key);
        return {
          key: target.key,
          name: target.name,
          description: target.description,
          status: exists ? 'already_exists' : 'missing',
        };
      });

      report.push({
        collection: plan.collectionName,
        displayName: plan.displayName,
        totalExistingIndexes: existing.length,
        targetsChecked: indexDetails,
      });
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      report,
    });
  } catch (error) {
    console.error('Database index status error:', error);
    res.status(500).json({ success: false, message: 'انڈیکسنگ معلومات حاصل کرنے میں خرابی: ' + error.message });
  }
});

// @route   POST /api/database/optimize
// @desc    Safely inspect and build missing database indexes (Safe, Idempotent, Non-destructive)
// @access  Admin only
router.post('/optimize', protect, authorize('master_admin'), async (req, res) => {
  const startTime = Date.now();
  const operationsLog = [];
  let createdCount = 0;
  let alreadyExistsCount = 0;
  let failedCount = 0;

  try {
    for (const plan of TARGET_INDEX_PLANS) {
      const collection = plan.model.collection;
      let existingIndexes = [];

      try {
        existingIndexes = await collection.indexes();
      } catch (err) {
        console.warn(`Could not fetch existing indexes for ${plan.collectionName}:`, err.message);
        existingIndexes = [];
      }

      for (const target of plan.indexes) {
        const alreadyPresent = indexExists(existingIndexes, target.key);

        if (alreadyPresent) {
          alreadyExistsCount++;
          operationsLog.push({
            collection: plan.collectionName,
            displayName: plan.displayName,
            key: target.key,
            name: target.name,
            description: target.description,
            action: 'already_exists',
            message: `انڈیکس پہلے سے موجود ہے (${target.description})`,
          });
        } else {
          try {
            await collection.createIndex(target.key, target.options || { background: true });
            createdCount++;
            operationsLog.push({
              collection: plan.collectionName,
              displayName: plan.displayName,
              key: target.key,
              name: target.name,
              description: target.description,
              action: 'created',
              message: `نیا انڈیکس کامیابی سے بن گیا (${target.description})`,
            });
          } catch (createErr) {
            failedCount++;
            operationsLog.push({
              collection: plan.collectionName,
              displayName: plan.displayName,
              key: target.key,
              name: target.name,
              description: target.description,
              action: 'failed',
              message: `انڈیکس بنانے میں خرابی: ${createErr.message}`,
            });
          }
        }
      }
    }

    const durationMs = Date.now() - startTime;

    res.json({
      success: failedCount === 0,
      operation: 'Database Indexing & Optimization',
      durationMs,
      summary: {
        totalChecked: createdCount + alreadyExistsCount + failedCount,
        created: createdCount,
        alreadyExists: alreadyExistsCount,
        failed: failedCount,
      },
      message:
        createdCount > 0
          ? `ڈیٹا بیس آپٹیمائزیشن مکمل! ${createdCount} نئے انڈیکس بنائے گئے اور ${alreadyExistsCount} پہلے سے موجود تھے۔`
          : `ڈیٹا بیس پہلے سے مکمل آپٹیمائز ہے۔ تمام ${alreadyExistsCount} مطلوبہ انڈیکس درست حالت میں موجود ہیں۔`,
      details: operationsLog,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database optimization critical error:', error);
    res.status(500).json({
      success: false,
      message: 'ڈیٹا بیس آپٹیمائزیشن میں خرابی ہوئی: ' + error.message,
      durationMs: Date.now() - startTime,
    });
  }
});

module.exports = router;
