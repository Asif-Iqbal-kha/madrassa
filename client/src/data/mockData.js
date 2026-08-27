// Mock data for frontend testing
// This file simulates backend data for development

// Test credentials for login
export const TEST_CREDENTIALS = {
  master_admin: { username: 'admin', password: 'admin123', role: 'master_admin' },
  teacher: { username: 'teacher', password: 'teacher123', role: 'teacher' },
  student: { username: 'student', password: 'student123', role: 'student' },
};

// Classes
export const MOCK_CLASSES = [
  { _id: 'c1', name: 'ناظرہ', year: '1446', teacher: 't1', studentsCount: 25, isActive: true },
  { _id: 'c2', name: 'حفظ', year: '1446', teacher: 't2', studentsCount: 18, isActive: true },
  { _id: 'c3', name: 'درجہ اول', year: '1446', teacher: 't3', studentsCount: 30, isActive: true },
  { _id: 'c4', name: 'درجہ دوم', year: '1446', teacher: 't1', studentsCount: 22, isActive: true },
  { _id: 'c5', name: 'درجہ سوم', year: '1446', teacher: 't2', studentsCount: 28, isActive: true },
  { _id: 'c6', name: 'درجہ چہارم', year: '1446', teacher: 't3', studentsCount: 20, isActive: true },
  { _id: 'c7', name: 'درجہ پنجم', year: '1446', teacher: 't1', studentsCount: 15, isActive: true },
  { _id: 'c8', name: 'درجہ ششم', year: '1446', teacher: 't2', studentsCount: 19, isActive: true },
  { _id: 'c9', name: 'درجہ ہفتم', year: '1446', teacher: 't3', studentsCount: 17, isActive: true },
  { _id: 'c10', name: 'درجہ ہشتم', year: '1446', teacher: 't1', studentsCount: 12, isActive: true },
];

// Teachers
export const MOCK_TEACHERS = [
  { _id: 't1', name: 'مولانا عبدالرحمٰن', subject: 'تفسیر و حدیث', phone: '03001234567', qualification: 'شہادۃ العالمیہ', classes: ['ناظرہ', 'درجہ دوم', 'درجہ پنجم', 'درجہ ہشتم'], isActive: true },
  { _id: 't2', name: 'قاری محمد یوسف', subject: 'حفظ القرآن', phone: '03009876543', qualification: 'سند حفظ و قراءت', classes: ['حفظ', 'درجہ سوم', 'درجہ ششم'], isActive: true },
  { _id: 't3', name: 'مولانا سعید احمد', subject: 'فقہ و عربی', phone: '03004567890', qualification: 'فضیلت', classes: ['درجہ اول', 'درجہ چہارم', 'درجہ ہفتم'], isActive: true },
  { _id: 't4', name: 'حافظ عمر فاروق', subject: 'ناظرہ و تجوید', phone: '03007654321', qualification: 'سند تجوید', classes: [], isActive: true },
  { _id: 't5', name: 'مولانا خالد محمود', subject: 'عربی ادب', phone: '03002345678', qualification: 'شہادۃ العالمیہ', classes: [], isActive: false },
];

// Students
export const MOCK_STUDENTS = [
  { _id: 's1', name: 'محمد احمد', fatherName: 'محمد اکرم', rollNumber: '1001', class: 'درجہ سوم', classId: 'c5', dateOfBirth: '2012-03-15', phone: '03001111111', address: 'محلہ نو، مردان', status: 'active', enrollmentDate: '2024-04-01' },
  { _id: 's2', name: 'عبداللہ', fatherName: 'محمد نعیم', rollNumber: '1002', class: 'درجہ سوم', classId: 'c5', dateOfBirth: '2011-07-22', phone: '03002222222', address: 'بابا صاحب، مردان', status: 'active', enrollmentDate: '2024-04-01' },
  { _id: 's3', name: 'حافظ عثمان', fatherName: 'عبدالغفار', rollNumber: '1003', class: 'حفظ', classId: 'c2', dateOfBirth: '2010-01-10', phone: '03003333333', address: 'شیخ مالتون، مردان', status: 'active', enrollmentDate: '2023-04-01' },
  { _id: 's4', name: 'محمد بلال', fatherName: 'محمد اسلم', rollNumber: '1004', class: 'ناظرہ', classId: 'c1', dateOfBirth: '2013-11-05', phone: '03004444444', address: 'گلبرگ، مردان', status: 'active', enrollmentDate: '2025-04-01' },
  { _id: 's5', name: 'عبدالرحمٰن', fatherName: 'فضل الرحمٰن', rollNumber: '1005', class: 'درجہ اول', classId: 'c3', dateOfBirth: '2012-09-18', phone: '03005555555', address: 'پار حتی، مردان', status: 'active', enrollmentDate: '2024-04-01' },
  { _id: 's6', name: 'محمد حسن', fatherName: 'محمد علی', rollNumber: '1006', class: 'درجہ دوم', classId: 'c4', dateOfBirth: '2011-05-25', phone: '03006666666', address: 'نہر کنارہ، مردان', status: 'active', enrollmentDate: '2024-04-01' },
  { _id: 's7', name: 'سعد بن ابی وقاص', fatherName: 'محمد فاروق', rollNumber: '1007', class: 'درجہ چہارم', classId: 'c6', dateOfBirth: '2010-12-30', phone: '03007777777', address: 'مردان خاص', status: 'active', enrollmentDate: '2023-04-01' },
  { _id: 's8', name: 'زید بن حارث', fatherName: 'حارث خان', rollNumber: '1008', class: 'درجہ پنجم', classId: 'c7', dateOfBirth: '2009-08-14', phone: '03008888888', address: 'تختہ بند، مردان', status: 'active', enrollmentDate: '2022-04-01' },
  { _id: 's9', name: 'خالد بن ولید', fatherName: 'ولید احمد', rollNumber: '1009', class: 'درجہ ششم', classId: 'c8', dateOfBirth: '2009-02-20', phone: '03009999999', address: 'لنڈ خور، مردان', status: 'active', enrollmentDate: '2022-04-01' },
  { _id: 's10', name: 'عمر بن عبدالعزیز', fatherName: 'عبدالعزیز', rollNumber: '1010', class: 'درجہ ہشتم', classId: 'c10', dateOfBirth: '2008-06-12', phone: '03001010101', address: 'رسالپور روڈ، مردان', status: 'active', enrollmentDate: '2021-04-01' },
];

// News
export const MOCK_NEWS = [
  {
    _id: 'n1',
    title: 'سالانہ امتحانات کا شیڈول جاری',
    content: 'مدرسہ سیدنا صدیق اکبرؓ کے سالانہ امتحانات کا شیڈول جاری کر دیا گیا ہے۔ تمام طلباء سے گزارش ہے کہ وہ امتحانات کی تیاری مکمل کر لیں۔ امتحانات یکم شوال سے شروع ہوں گے اور پندرہ شوال تک جاری رہیں گے۔ تمام طلباء کو لازمی طور پر وقت پر حاضر ہونا ہوگا۔',
    category: 'announcement',
    isPublished: true,
    publishDate: '2026-08-25',
    image: null,
  },
  {
    _id: 'n2',
    title: 'نئے تعلیمی سال کے داخلے شروع',
    content: 'مدرسہ سیدنا صدیق اکبرؓ میں نئے تعلیمی سال کے داخلے شروع ہو چکے ہیں۔ ناظرہ، حفظ اور درجہ اول سے درجہ ہشتم تک داخلے دستیاب ہیں۔ دلچسپی رکھنے والے والدین مدرسہ کے دفتر سے رابطہ کریں۔ داخلہ فارم دفتر سے حاصل کیے جا سکتے ہیں۔',
    category: 'news',
    isPublished: true,
    publishDate: '2026-08-20',
    image: null,
  },
  {
    _id: 'n3',
    title: 'حفظ القرآن تقریب تقسیم اسناد',
    content: 'مدرسہ سیدنا صدیق اکبرؓ میں حفظ القرآن مکمل کرنے والے طلباء کی تقریب تقسیم اسناد کا انعقاد کیا گیا۔ اس تثریب میں علاقے کے ممتاز علماء کرام نے شرکت فرمائی اور طلباء کو اسناد تقسیم کیں۔',
    category: 'event',
    isPublished: true,
    publishDate: '2026-08-15',
    image: null,
  },
  {
    _id: 'n4',
    title: 'مدرسہ کی سالانہ تقریب کا انعقاد',
    content: 'مدرسہ سیدنا صدیق اکبرؓ کی سالانہ تقریب کا شاندار انعقاد کیا گیا جس میں طلباء نے تلاوت قرآن، حمد و نعت اور تقاریر پیش کیں۔ تقریب میں بڑی تعداد میں والدین اور مہمانان نے شرکت کی۔',
    category: 'event',
    isPublished: true,
    publishDate: '2026-08-10',
    image: null,
  },
  {
    _id: 'n5',
    title: 'اساتذہ کی تربیتی ورکشاپ',
    content: 'مدرسہ کے اساتذہ کے لیے ایک خصوصی تربیتی ورکشاپ کا انعقاد کیا گیا جس میں جدید تدریسی طریقوں اور طلباء کی نفسیات پر تفصیلی گفتگو ہوئی۔',
    category: 'news',
    isPublished: true,
    publishDate: '2026-08-05',
    image: null,
  },
];

// Attendance data for a class on a specific date
export const MOCK_ATTENDANCE = [
  { date: '2026-08-27', classId: 'c5', className: 'درجہ سوم', records: [
    { studentId: 's1', name: 'محمد احمد', rollNumber: '1001', status: 'present' },
    { studentId: 's2', name: 'عبداللہ', rollNumber: '1002', status: 'present' },
  ]},
  { date: '2026-08-26', classId: 'c5', className: 'درجہ سوم', records: [
    { studentId: 's1', name: 'محمد احمد', rollNumber: '1001', status: 'present' },
    { studentId: 's2', name: 'عبداللہ', rollNumber: '1002', status: 'absent' },
  ]},
  { date: '2026-08-25', classId: 'c5', className: 'درجہ سوم', records: [
    { studentId: 's1', name: 'محمد احمد', rollNumber: '1001', status: 'present' },
    { studentId: 's2', name: 'عبداللہ', rollNumber: '1002', status: 'present' },
  ]},
];

// Student attendance summary (for student dashboard)
export const MOCK_STUDENT_ATTENDANCE = {
  totalDays: 120,
  presentDays: 108,
  absentDays: 8,
  leaveDays: 4,
  percentage: 90,
  monthly: [
    { month: 'محرم', total: 24, present: 22, absent: 1, leave: 1 },
    { month: 'صفر', total: 24, present: 21, absent: 2, leave: 1 },
    { month: 'ربیع الاول', total: 24, present: 23, absent: 1, leave: 0 },
    { month: 'ربیع الثانی', total: 24, present: 22, absent: 1, leave: 1 },
    { month: 'جمادی الاول', total: 24, present: 20, absent: 3, leave: 1 },
  ],
};

// Exam results
export const MOCK_EXAMS = [
  { _id: 'e1', name: 'ششماہی امتحان', class: 'درجہ سوم', classId: 'c5', year: '1446', isPublished: true },
  { _id: 'e2', name: 'سالانہ امتحان', class: 'درجہ سوم', classId: 'c5', year: '1445', isPublished: true },
];

export const MOCK_RESULTS = [
  {
    _id: 'r1',
    examId: 'e1',
    examName: 'ششماہی امتحان',
    studentId: 's1',
    studentName: 'محمد احمد',
    rollNumber: '1001',
    className: 'درجہ سوم',
    year: '1446',
    marks: [
      { subject: 'قرآن مجید', obtainedMarks: 85, totalMarks: 100 },
      { subject: 'حدیث شریف', obtainedMarks: 78, totalMarks: 100 },
      { subject: 'فقہ', obtainedMarks: 82, totalMarks: 100 },
      { subject: 'عربی', obtainedMarks: 75, totalMarks: 100 },
      { subject: 'اردو', obtainedMarks: 88, totalMarks: 100 },
      { subject: 'ریاضی', obtainedMarks: 70, totalMarks: 100 },
    ],
    totalObtained: 478,
    totalMarks: 600,
    percentage: 79.67,
    grade: 'ب+',
  },
  {
    _id: 'r2',
    examId: 'e2',
    examName: 'سالانہ امتحان',
    studentId: 's1',
    studentName: 'محمد احمد',
    rollNumber: '1001',
    className: 'درجہ سوم',
    year: '1445',
    marks: [
      { subject: 'قرآن مجید', obtainedMarks: 90, totalMarks: 100 },
      { subject: 'حدیث شریف', obtainedMarks: 82, totalMarks: 100 },
      { subject: 'فقہ', obtainedMarks: 86, totalMarks: 100 },
      { subject: 'عربی', obtainedMarks: 80, totalMarks: 100 },
      { subject: 'اردو', obtainedMarks: 92, totalMarks: 100 },
      { subject: 'ریاضی', obtainedMarks: 74, totalMarks: 100 },
    ],
    totalObtained: 504,
    totalMarks: 600,
    percentage: 84,
    grade: 'الف',
  },
];

// Users (for admin management)
export const MOCK_USERS = [
  { _id: 'u1', name: 'ایڈمن', username: 'admin', role: 'master_admin', isActive: true },
  { _id: 'u2', name: 'مولانا عبدالرحمٰن', username: 'teacher', role: 'teacher', isActive: true },
  { _id: 'u3', name: 'محمد احمد', username: 'student', role: 'student', isActive: true },
];

// Current logged-in user profiles
export const MOCK_USER_PROFILES = {
  master_admin: {
    _id: 'u1',
    name: 'ایڈمن',
    username: 'admin',
    role: 'master_admin',
    phone: '03001234567',
  },
  teacher: {
    _id: 'u2',
    name: 'مولانا عبدالرحمٰن',
    username: 'teacher',
    role: 'teacher',
    phone: '03001234567',
    subject: 'تفسیر و حدیث',
    qualification: 'شہادۃ العالمیہ',
    classes: [
      { _id: 'c1', name: 'ناظرہ' },
      { _id: 'c4', name: 'درجہ دوم' },
      { _id: 'c7', name: 'درجہ پنجم' },
      { _id: 'c10', name: 'درجہ ہشتم' },
    ],
  },
  student: {
    _id: 'u3',
    name: 'محمد احمد',
    username: 'student',
    role: 'student',
    rollNumber: '1001',
    fatherName: 'محمد اکرم',
    className: 'درجہ سوم',
    classId: 'c5',
    phone: '03001111111',
    address: 'محلہ نو، مردان',
    enrollmentDate: '2024-04-01',
  },
};

// Dashboard statistics
export const MOCK_STATS = {
  totalStudents: 206,
  totalTeachers: 5,
  totalClasses: 10,
  activeStudents: 198,
  todayAttendance: 182,
  attendancePercentage: 92,
};
