/**
 * Database Seed Script
 * Populates MongoDB with all mock data from the frontend
 * 
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}


// Models
const User = require('./models/User');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const News = require('./models/News');
const Attendance = require('./models/Attendance');
const Exam = require('./models/Exam');
const Result = require('./models/Result');
const Donation = require('./models/Donation');
const AdmissionApplication = require('./models/AdmissionApplication');

const seedDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/madrassa_db');
    }
    console.log('MongoDB Ready for seeding...\n');

    // Clear all collections
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await News.deleteMany({});
    await Attendance.deleteMany({});
    await Exam.deleteMany({});
    await Result.deleteMany({});
    await Donation.deleteMany({});
    await AdmissionApplication.deleteMany({});
    console.log('All collections cleared.\n');

    // ====== CLASSES ======
    console.log('Seeding Classes...');
    const classesData = [
      { name: 'ناظرہ', year: '1446', studentsCount: 25, isActive: true },
      { name: 'حفظ', year: '1446', studentsCount: 18, isActive: true },
      { name: 'درجہ اول', year: '1446', studentsCount: 30, isActive: true },
      { name: 'درجہ دوم', year: '1446', studentsCount: 22, isActive: true },
      { name: 'درجہ سوم', year: '1446', studentsCount: 28, isActive: true },
      { name: 'درجہ چہارم', year: '1446', studentsCount: 20, isActive: true },
      { name: 'درجہ پنجم', year: '1446', studentsCount: 15, isActive: true },
      { name: 'درجہ ششم', year: '1446', studentsCount: 19, isActive: true },
      { name: 'درجہ ہفتم', year: '1446', studentsCount: 17, isActive: true },
      { name: 'درجہ ہشتم', year: '1446', studentsCount: 12, isActive: true },
    ];
    const classes = await Class.insertMany(classesData);
    console.log(`  ✓ ${classes.length} classes created`);

    // ====== TEACHERS ======
    console.log('Seeding Teachers...');
    const teachersData = [
      { name: 'مولانا عبدالرحمٰن', subject: 'تفسیر و حدیث', phone: '03001234567', qualification: 'شہادۃ العالمیہ', classNames: ['ناظرہ', 'درجہ دوم', 'درجہ پنجم', 'درجہ ہشتم'], isActive: true },
      { name: 'قاری محمد یوسف', subject: 'حفظ القرآن', phone: '03009876543', qualification: 'سند حفظ و قراءت', classNames: ['حفظ', 'درجہ سوم', 'درجہ ششم'], isActive: true },
      { name: 'مولانا سعید احمد', subject: 'فقہ و عربی', phone: '03004567890', qualification: 'فضیلت', classNames: ['درجہ اول', 'درجہ چہارم', 'درجہ ہفتم'], isActive: true },
      { name: 'حافظ عمر فاروق', subject: 'ناظرہ و تجوید', phone: '03007654321', qualification: 'سند تجوید', classNames: [], isActive: true },
      { name: 'مولانا خالد محمود', subject: 'عربی ادب', phone: '03002345678', qualification: 'شہادۃ العالمیہ', classNames: [], isActive: false },
    ];

    // Link class ObjectIds to teachers
    for (const t of teachersData) {
      t.classes = t.classNames.map((cn) => {
        const found = classes.find((c) => c.name === cn);
        return found ? found._id : null;
      }).filter(Boolean);
    }

    const teachers = await Teacher.insertMany(teachersData);
    console.log(`  ✓ ${teachers.length} teachers created`);

    // Update classes with teacher references
    for (const cls of classes) {
      const teacher = teachers.find((t) => t.classNames.includes(cls.name));
      if (teacher) {
        cls.teacher = teacher._id;
        await cls.save();
      }
    }

    // ====== STUDENTS ======
    console.log('Seeding Students...');
    const studentsData = [
      { name: 'محمد احمد', fatherName: 'محمد اکرم', rollNumber: '1001', className: 'درجہ سوم', dateOfBirth: '2012-03-15', phone: '03001111111', address: 'محلہ نو، مردان', status: 'active', enrollmentDate: '2024-04-01' },
      { name: 'عبداللہ', fatherName: 'محمد نعیم', rollNumber: '1002', className: 'درجہ سوم', dateOfBirth: '2011-07-22', phone: '03002222222', address: 'بابا صاحب، مردان', status: 'active', enrollmentDate: '2024-04-01' },
      { name: 'حافظ عثمان', fatherName: 'عبدالغفار', rollNumber: '1003', className: 'حفظ', dateOfBirth: '2010-01-10', phone: '03003333333', address: 'شیخ مالتون، مردان', status: 'active', enrollmentDate: '2023-04-01' },
      { name: 'محمد بلال', fatherName: 'محمد اسلم', rollNumber: '1004', className: 'ناظرہ', dateOfBirth: '2013-11-05', phone: '03004444444', address: 'گلبرگ، مردان', status: 'active', enrollmentDate: '2025-04-01' },
      { name: 'عبدالرحمٰن', fatherName: 'فضل الرحمٰن', rollNumber: '1005', className: 'درجہ اول', dateOfBirth: '2012-09-18', phone: '03005555555', address: 'پار حتی، مردان', status: 'active', enrollmentDate: '2024-04-01' },
      { name: 'محمد حسن', fatherName: 'محمد علی', rollNumber: '1006', className: 'درجہ دوم', dateOfBirth: '2011-05-25', phone: '03006666666', address: 'نہر کنارہ، مردان', status: 'active', enrollmentDate: '2024-04-01' },
      { name: 'سعد بن ابی وقاص', fatherName: 'محمد فاروق', rollNumber: '1007', className: 'درجہ چہارم', dateOfBirth: '2010-12-30', phone: '03007777777', address: 'مردان خاص', status: 'active', enrollmentDate: '2023-04-01' },
      { name: 'زید بن حارث', fatherName: 'حارث خان', rollNumber: '1008', className: 'درجہ پنجم', dateOfBirth: '2009-08-14', phone: '03008888888', address: 'تختہ بند، مردان', status: 'active', enrollmentDate: '2022-04-01' },
      { name: 'خالد بن ولید', fatherName: 'ولید احمد', rollNumber: '1009', className: 'درجہ ششم', dateOfBirth: '2009-02-20', phone: '03009999999', address: 'لنڈ خور، مردان', status: 'active', enrollmentDate: '2022-04-01' },
      { name: 'عمر بن عبدالعزیز', fatherName: 'عبدالعزیز', rollNumber: '1010', className: 'درجہ ہشتم', dateOfBirth: '2008-06-12', phone: '03001010101', address: 'رسالپور روڈ، مردان', status: 'active', enrollmentDate: '2021-04-01' },
    ];

    // Link class ObjectIds
    for (const s of studentsData) {
      const found = classes.find((c) => c.name === s.className);
      if (found) s.class = found._id;
    }

    const students = await Student.insertMany(studentsData);
    console.log(`  ✓ ${students.length} students created`);

    // ====== USERS ======
    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'ایڈمن',
      username: 'admin',
      password: 'admin123',
      role: 'master_admin',
      phone: '03001234567',
    });

    const teacherUser = await User.create({
      name: 'مولانا عبدالرحمٰن',
      username: 'teacher',
      password: 'teacher123',
      role: 'teacher',
      phone: '03001234567',
      teacherProfile: teachers[0]._id,
    });

    const studentUser = await User.create({
      name: 'محمد احمد',
      username: 'student',
      password: 'student123',
      role: 'student',
      phone: '03001111111',
      studentProfile: students[0]._id,
    });
    console.log(`  ✓ 3 users created (admin, teacher, student)`);

    // ====== NEWS ======
    console.log('Seeding News...');
    const newsData = [
      { title: 'سالانہ امتحانات کا شیڈول جاری', content: 'مدرسہ سیدنا صدیق اکبرؓ کے سالانہ امتحانات کا شیڈول جاری کر دیا گیا ہے۔ تمام طلباء سے گزارش ہے کہ وہ امتحانات کی تیاری مکمل کر لیں۔ امتحانات یکم شوال سے شروع ہوں گے اور پندرہ شوال تک جاری رہیں گے۔ تمام طلباء کو لازمی طور پر وقت پر حاضر ہونا ہوگا۔', category: 'announcement', isPublished: true, publishDate: '2026-08-25' },
      { title: 'نئے تعلیمی سال کے داخلے شروع', content: 'مدرسہ سیدنا صدیق اکبرؓ میں نئے تعلیمی سال کے داخلے شروع ہو چکے ہیں۔ ناظرہ، حفظ اور درجہ اول سے درجہ ہشتم تک داخلے دستیاب ہیں۔', category: 'news', isPublished: true, publishDate: '2026-08-20' },
      { title: 'حفظ القرآن تقریب تقسیم اسناد', content: 'مدرسہ سیدنا صدیق اکبرؓ میں حفظ القرآن مکمل کرنے والے طلباء کی تقریب تقسیم اسناد کا انعقاد کیا گیا۔', category: 'event', isPublished: true, publishDate: '2026-08-15' },
      { title: 'مدرسہ کی سالانہ تقریب کا انعقاد', content: 'مدرسہ سیدنا صدیق اکبرؓ کی سالانہ تقریب کا شاندار انعقاد کیا گیا جس میں طلباء نے تلاوت قرآن، حمد و نعت اور تقاریر پیش کیں۔', category: 'event', isPublished: true, publishDate: '2026-08-10' },
      { title: 'اساتذہ کی تربیتی ورکشاپ', content: 'مدرسہ کے اساتذہ کے لیے ایک خصوصی تربیتی ورکشاپ کا انعقاد کیا گیا جس میں جدید تدریسی طریقوں پر گفتگو ہوئی۔', category: 'news', isPublished: true, publishDate: '2026-08-05' },
    ];
    const news = await News.insertMany(newsData);
    console.log(`  ✓ ${news.length} news articles created`);

    // ====== EXAMS ======
    console.log('Seeding Exams...');
    const examsData = [
      { name: 'ششماہی امتحان', class: classes[4]._id, className: 'درجہ سوم', year: '1446', isPublished: true },
      { name: 'سالانہ امتحان', class: classes[4]._id, className: 'درجہ سوم', year: '1445', isPublished: true },
    ];
    const exams = await Exam.insertMany(examsData);
    console.log(`  ✓ ${exams.length} exams created`);

    // ====== RESULTS ======
    console.log('Seeding Results...');
    const resultsData = [
      {
        exam: exams[0]._id, examName: 'ششماہی امتحان', student: students[0]._id, studentName: 'محمد احمد',
        rollNumber: '1001', className: 'درجہ سوم', year: '1446',
        marks: [
          { subject: 'قرآن مجید', obtainedMarks: 85, totalMarks: 100 },
          { subject: 'حدیث شریف', obtainedMarks: 78, totalMarks: 100 },
          { subject: 'فقہ', obtainedMarks: 82, totalMarks: 100 },
          { subject: 'عربی', obtainedMarks: 75, totalMarks: 100 },
          { subject: 'اردو', obtainedMarks: 88, totalMarks: 100 },
          { subject: 'ریاضی', obtainedMarks: 70, totalMarks: 100 },
        ],
        totalObtained: 478, totalMarks: 600, percentage: 79.67, grade: 'ب+',
      },
      {
        exam: exams[1]._id, examName: 'سالانہ امتحان', student: students[0]._id, studentName: 'محمد احمد',
        rollNumber: '1001', className: 'درجہ سوم', year: '1445',
        marks: [
          { subject: 'قرآن مجید', obtainedMarks: 90, totalMarks: 100 },
          { subject: 'حدیث شریف', obtainedMarks: 82, totalMarks: 100 },
          { subject: 'فقہ', obtainedMarks: 86, totalMarks: 100 },
          { subject: 'عربی', obtainedMarks: 80, totalMarks: 100 },
          { subject: 'اردو', obtainedMarks: 92, totalMarks: 100 },
          { subject: 'ریاضی', obtainedMarks: 74, totalMarks: 100 },
        ],
        totalObtained: 504, totalMarks: 600, percentage: 84, grade: 'الف',
      },
    ];
    const results = await Result.insertMany(resultsData);
    console.log(`  ✓ ${results.length} results created`);

    // ====== ATTENDANCE ======
    console.log('Seeding Attendance...');
    const attendanceData = [
      { date: '2026-08-27', class: classes[4]._id, className: 'درجہ سوم', records: [
        { student: students[0]._id, studentName: 'محمد احمد', rollNumber: '1001', status: 'present' },
        { student: students[1]._id, studentName: 'عبداللہ', rollNumber: '1002', status: 'present' },
      ]},
      { date: '2026-08-26', class: classes[4]._id, className: 'درجہ سوم', records: [
        { student: students[0]._id, studentName: 'محمد احمد', rollNumber: '1001', status: 'present' },
        { student: students[1]._id, studentName: 'عبداللہ', rollNumber: '1002', status: 'absent' },
      ]},
      { date: '2026-08-25', class: classes[4]._id, className: 'درجہ سوم', records: [
        { student: students[0]._id, studentName: 'محمد احمد', rollNumber: '1001', status: 'present' },
        { student: students[1]._id, studentName: 'عبداللہ', rollNumber: '1002', status: 'present' },
      ]},
    ];
    const attendance = await Attendance.insertMany(attendanceData);
    console.log(`  ✓ ${attendance.length} attendance records created`);

    // ====== DONATIONS ======
    console.log('Seeding Donations...');
    const donationsData = [
      { trackingNumber: 'DON-2026-0001', donorName: 'حاجی عبدالکریم', phone: '03011234567', amount: 50000, method: 'JazzCash', status: 'approved', date: '2026-08-20', adminNotes: 'رقم موصول ہوئی' },
      { trackingNumber: 'DON-2026-0002', donorName: 'محمد اکبر خان', phone: '03029876543', amount: 25000, method: 'EasyPaisa', status: 'pending', date: '2026-08-25' },
      { trackingNumber: 'DON-2026-0003', donorName: 'حافظ نور محمد', phone: '03034567890', amount: 100000, method: 'بینک ٹرانسفر', status: 'approved', date: '2026-08-22', adminNotes: 'بینک سے تصدیق ہو گئی' },
      { trackingNumber: 'DON-2026-0004', donorName: 'سید فضل الرحمٰن', phone: '03045678901', amount: 10000, method: 'JazzCash', status: 'rejected', date: '2026-08-26', adminNotes: 'اسکرین شاٹ واضح نہیں ہے' },
      { trackingNumber: 'DON-2026-0005', donorName: 'عبدالوہاب', phone: '03056789012', amount: 75000, method: 'EasyPaisa', status: 'pending', date: '2026-08-27' },
    ];
    const donations = await Donation.insertMany(donationsData);
    console.log(`  ✓ ${donations.length} donations created`);

    // ====== ADMISSION APPLICATIONS ======
    console.log('Seeding Admission Applications...');
    const admissionsData = [
      { trackingNumber: 'ADM-2026-0001', studentName: 'محمد یاسین', fatherName: 'محمد صدیق', cnic: '1234567890123', phone: '03011112222', desiredClass: 'ناظرہ', previousEducation: 'پرائمری پاس', address: 'محلہ قاضیان، مردان', dateOfBirth: '2014-05-10', status: 'admitted', queuePosition: 1, date: '2026-08-15', adminNotes: 'داخلہ منظور' },
      { trackingNumber: 'ADM-2026-0002', studentName: 'عبداللہ بن عمر', fatherName: 'عمر حیات', cnic: '1234567890124', phone: '03022223333', desiredClass: 'حفظ', previousEducation: 'ناظرہ مکمل', address: 'تحصیل روڈ، مردان', dateOfBirth: '2012-08-20', status: 'under_review', queuePosition: 2, date: '2026-08-18', adminNotes: 'ٹیسٹ باقی ہے' },
      { trackingNumber: 'ADM-2026-0003', studentName: 'حمزہ', fatherName: 'خالد محمود', cnic: '1234567890125', phone: '03033334444', desiredClass: 'درجہ اول', previousEducation: 'حفظ مکمل', address: 'شیر گڑھ، مردان', dateOfBirth: '2011-03-15', status: 'pending', queuePosition: 3, date: '2026-08-22' },
      { trackingNumber: 'ADM-2026-0004', studentName: 'ابوبکر', fatherName: 'عبدالستار', cnic: '1234567890126', phone: '03044445555', desiredClass: 'ناظرہ', previousEducation: 'کوئی نہیں', address: 'پار حتی، مردان', dateOfBirth: '2015-11-25', status: 'pending', queuePosition: 4, date: '2026-08-25' },
      { trackingNumber: 'ADM-2026-0005', studentName: 'عثمان غنی', fatherName: 'غنی الرحمٰن', cnic: '1234567890127', phone: '03055556666', desiredClass: 'درجہ سوم', previousEducation: 'درجہ دوم پاس', address: 'لنڈ خور، مردان', dateOfBirth: '2012-07-08', status: 'rejected', queuePosition: 5, date: '2026-08-20', adminNotes: 'عمر کم ہے' },
    ];
    const admissions = await AdmissionApplication.insertMany(admissionsData);
    console.log(`  ✓ ${admissions.length} admission applications created`);

    console.log('\n================================');
    console.log('  ✅ Database seeded successfully!');
    console.log('================================');
    console.log('\nTest Credentials:');
    console.log('  Admin:   admin / admin123');
    console.log('  Teacher: teacher / teacher123');
    console.log('  Student: student / student123\n');

    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('\n❌ Seed error:', error.message);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;

