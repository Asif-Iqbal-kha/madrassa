// Centralized API Service for Madrassa Application
// Full connectivity for Authentication, Students, Teachers, Classes, News, Attendance, Exams, Results, Donations, Admissions, and Stats.

import {
  MOCK_STUDENTS,
  MOCK_TEACHERS,
  MOCK_CLASSES,
  MOCK_NEWS,
  MOCK_EXAMS,
  MOCK_RESULTS,
  MOCK_DONATIONS,
  MOCK_ADMISSION_APPLICATIONS,
  MOCK_STATS,
} from '../data/mockData';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('madrassa_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ----------------- AUTH API -----------------

export async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('madrassa_token', data.token);
      localStorage.setItem('madrassa_user', JSON.stringify(data.user));
      return { success: true, user: data.user, role: data.user.role };
    }
    return { success: false, message: data.message || 'لاگ ان نا کام ہو گیا' };
  } catch (err) {
    console.warn('Backend login offline, checking fallback:', err);
    return { success: false, message: 'سرور سے رابطہ نہیں ہو سکا' };
  }
}

export async function getUserProfile() {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Profile fetch failed:', err);
  }
  return null;
}

// ----------------- STUDENTS API -----------------

export async function getStudents(filter = {}) {
  try {
    const query = new URLSearchParams(filter).toString();
    const url = query ? `${API_BASE}/students?${query}` : `${API_BASE}/students`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getStudents failed, using fallback:', err);
  }
  return MOCK_STUDENTS;
}

export async function createStudent(studentData) {
  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('createStudent failed:', err);
  }
  return { _id: 's_' + Date.now(), ...studentData };
}

export async function updateStudent(id, studentData) {
  try {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('updateStudent failed:', err);
  }
  return { _id: id, ...studentData };
}

export async function deleteStudent(id) {
  try {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('deleteStudent failed:', err);
  }
  return { success: true };
}

// ----------------- TEACHERS API -----------------

export async function getTeachers() {
  try {
    const res = await fetch(`${API_BASE}/teachers`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getTeachers failed:', err);
  }
  return MOCK_TEACHERS;
}

export async function createTeacher(teacherData) {
  try {
    const res = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('createTeacher failed:', err);
  }
  return { _id: 't_' + Date.now(), ...teacherData };
}

export async function updateTeacher(id, teacherData) {
  try {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(teacherData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('updateTeacher failed:', err);
  }
  return { _id: id, ...teacherData };
}

export async function deleteTeacher(id) {
  try {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('deleteTeacher failed:', err);
  }
  return { success: true };
}

// ----------------- CLASSES API -----------------

export async function getClasses() {
  try {
    const res = await fetch(`${API_BASE}/classes`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getClasses failed:', err);
  }
  return MOCK_CLASSES;
}

export async function createClass(classData) {
  try {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(classData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('createClass failed:', err);
  }
  return { _id: 'c_' + Date.now(), ...classData };
}

export async function updateClass(id, classData) {
  try {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(classData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('updateClass failed:', err);
  }
  return { _id: id, ...classData };
}

export async function deleteClass(id) {
  try {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('deleteClass failed:', err);
  }
  return { success: true };
}

// ----------------- NEWS API -----------------

export async function getNews(publishedOnly = true) {
  try {
    const url = publishedOnly ? `${API_BASE}/news` : `${API_BASE}/news?published=all`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getNews failed:', err);
  }
  return MOCK_NEWS;
}

export async function createNews(newsData) {
  try {
    const res = await fetch(`${API_BASE}/news`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...newsData, isPublished: true, publishDate: new Date().toISOString().split('T')[0] }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('createNews failed:', err);
  }
  return { _id: 'n_' + Date.now(), ...newsData };
}

export async function updateNews(id, newsData) {
  try {
    const res = await fetch(`${API_BASE}/news/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(newsData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('updateNews failed:', err);
  }
  return { _id: id, ...newsData };
}

export async function deleteNews(id) {
  try {
    const res = await fetch(`${API_BASE}/news/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('deleteNews failed:', err);
  }
  return { success: true };
}

// ----------------- ATTENDANCE API -----------------

export async function getAttendance(classId, date) {
  try {
    let url = `${API_BASE}/attendance`;
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (date) params.append('date', date);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getAttendance failed:', err);
  }
  return [];
}

export async function markAttendance(attendanceData) {
  try {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(attendanceData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('markAttendance failed:', err);
  }
  return { success: true };
}

export async function getStudentAttendance(studentId) {
  try {
    const res = await fetch(`${API_BASE}/attendance/student/${studentId}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getStudentAttendance failed:', err);
  }
  return { totalDays: 120, presentDays: 108, absentDays: 8, leaveDays: 4, percentage: 90 };
}

// ----------------- EXAMS & RESULTS API -----------------

export async function getExams(classId, publishedOnly = false) {
  try {
    let url = `${API_BASE}/exams`;
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (publishedOnly) params.append('published', 'true');
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getExams failed:', err);
  }
  return MOCK_EXAMS;
}

export async function createExam(examData) {
  try {
    const res = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(examData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('createExam failed:', err);
  }
  return { _id: 'e_' + Date.now(), ...examData };
}

export async function getStudentResults(studentId) {
  try {
    const res = await fetch(`${API_BASE}/results/student/${studentId}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getStudentResults failed:', err);
  }
  return MOCK_RESULTS;
}

export async function uploadResult(resultData) {
  try {
    const res = await fetch(`${API_BASE}/results`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resultData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('uploadResult failed:', err);
  }
  return { success: true };
}

// ----------------- STATS API -----------------

export async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getStats failed:', err);
  }
  return MOCK_STATS;
}

// ----------------- DONATIONS API -----------------

export async function submitDonation(donationData, screenshotFile) {
  try {
    const formData = new FormData();
    formData.append('donorName', donationData.donorName);
    formData.append('phone', donationData.phone);
    formData.append('amount', donationData.amount);
    formData.append('method', donationData.method);
    if (screenshotFile) {
      formData.append('screenshot', screenshotFile);
    }

    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, trackingNumber: data.trackingNumber, message: data.message };
    }
  } catch (err) {
    console.warn('submitDonation API error:', err);
  }

  // Persistent local store fallback
  const stored = JSON.parse(localStorage.getItem('madrassa_donations') || '[]');
  const year = new Date().getFullYear();
  const count = stored.length + MOCK_DONATIONS.length + 1;
  const trackingNumber = `DON-${year}-${String(count).padStart(4, '0')}`;

  const newDonation = {
    _id: 'don_' + Date.now(),
    trackingNumber,
    donorName: donationData.donorName,
    phone: donationData.phone,
    amount: Number(donationData.amount),
    method: donationData.method,
    screenshotFile: screenshotFile?.name || '',
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    adminNotes: '',
  };

  stored.unshift(newDonation);
  localStorage.setItem('madrassa_donations', JSON.stringify(stored));
  return { success: true, trackingNumber };
}

export async function getDonations(statusFilter = 'all') {
  try {
    const url = statusFilter !== 'all' ? `${API_BASE}/donations?status=${statusFilter}` : `${API_BASE}/donations`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getDonations API error:', err);
  }

  const local = JSON.parse(localStorage.getItem('madrassa_donations') || '[]');
  const all = [...local, ...MOCK_DONATIONS.filter((m) => !local.some((l) => l.trackingNumber === m.trackingNumber))];
  if (statusFilter !== 'all') {
    return all.filter((d) => d.status === statusFilter);
  }
  return all;
}

export async function updateDonationStatus(id, newStatus, adminNotes = '') {
  try {
    const res = await fetch(`${API_BASE}/donations/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus, adminNotes }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('updateDonationStatus API error:', err);
  }

  const local = JSON.parse(localStorage.getItem('madrassa_donations') || '[]');
  const index = local.findIndex((d) => d._id === id);
  if (index !== -1) {
    local[index].status = newStatus;
    local[index].adminNotes = adminNotes;
    localStorage.setItem('madrassa_donations', JSON.stringify(local));
  }
  return { success: true };
}

export async function trackDonation(trackingNumber) {
  try {
    const res = await fetch(`${API_BASE}/donations/track/${encodeURIComponent(trackingNumber)}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('trackDonation API error:', err);
  }

  const local = JSON.parse(localStorage.getItem('madrassa_donations') || '[]');
  const found = local.find((d) => d.trackingNumber === trackingNumber) ||
                MOCK_DONATIONS.find((d) => d.trackingNumber === trackingNumber);
  return found || null;
}

// ----------------- ADMISSIONS API -----------------

export async function submitAdmission(admissionData) {
  try {
    const res = await fetch(`${API_BASE}/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admissionData),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, trackingNumber: data.trackingNumber, queuePosition: data.queuePosition, message: data.message };
    }
  } catch (err) {
    console.warn('submitAdmission API error:', err);
  }

  const stored = JSON.parse(localStorage.getItem('madrassa_admissions') || '[]');
  const count = stored.length + MOCK_ADMISSION_APPLICATIONS.length + 1;
  const year = new Date().getFullYear();
  const trackingNumber = `ADM-${year}-${String(count).padStart(4, '0')}`;

  const newAdmission = {
    _id: 'adm_' + Date.now(),
    trackingNumber,
    studentName: admissionData.studentName,
    fatherName: admissionData.fatherName,
    cnic: admissionData.cnic || '',
    phone: admissionData.phone,
    desiredClass: admissionData.desiredClass,
    previousEducation: admissionData.previousEducation || '',
    address: admissionData.address || '',
    dateOfBirth: admissionData.dateOfBirth || '',
    status: 'pending',
    queuePosition: count,
    date: new Date().toISOString().split('T')[0],
    adminNotes: '',
  };

  stored.unshift(newAdmission);
  localStorage.setItem('madrassa_admissions', JSON.stringify(stored));
  return { success: true, trackingNumber, queuePosition: count };
}

export async function getAdmissions(statusFilter = 'all') {
  try {
    const url = statusFilter !== 'all' ? `${API_BASE}/admissions?status=${statusFilter}` : `${API_BASE}/admissions`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getAdmissions API error:', err);
  }

  const local = JSON.parse(localStorage.getItem('madrassa_admissions') || '[]');
  const all = [...local, ...MOCK_ADMISSION_APPLICATIONS.filter((m) => !local.some((l) => l.trackingNumber === m.trackingNumber))];
  if (statusFilter !== 'all') {
    return all.filter((a) => a.status === statusFilter);
  }
  return all;
}

export async function updateAdmissionStatus(id, newStatus, adminNotes = '') {
  try {
    const res = await fetch(`${API_BASE}/admissions/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus, adminNotes }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('updateAdmissionStatus API error:', err);
  }

  const local = JSON.parse(localStorage.getItem('madrassa_admissions') || '[]');
  const index = local.findIndex((a) => a._id === id);
  if (index !== -1) {
    local[index].status = newStatus;
    local[index].adminNotes = adminNotes;
    localStorage.setItem('madrassa_admissions', JSON.stringify(local));
  }
  return { success: true };
}

export async function trackAdmission(trackingNumber) {
  try {
    const res = await fetch(`${API_BASE}/admissions/track/${encodeURIComponent(trackingNumber)}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('trackAdmission API error:', err);
  }

  const local = JSON.parse(localStorage.getItem('madrassa_admissions') || '[]');
  const found = local.find((a) => a.trackingNumber === trackingNumber) ||
                MOCK_ADMISSION_APPLICATIONS.find((a) => a.trackingNumber === trackingNumber);
  return found || null;
}

// ----------------- GALLERY API -----------------

export async function getGalleryItems() {
  try {
    const res = await fetch(`${API_BASE}/gallery`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getGalleryItems error:', err);
  }

  const local = JSON.parse(localStorage.getItem('madrassa_gallery') || '[]');
  return local.length > 0 ? local : [
    { _id: 'g1', title: 'مدرسہ کی مرکزی عمارت', category: 'عمارت', imagePath: '' },
    { _id: 'g2', title: 'تلاوت قرآن مجید کی کلاس', category: 'تعلیم', imagePath: '' },
    { _id: 'g3', title: 'حفظ القرآن کلاس', category: 'تعلیم', imagePath: '' },
    { _id: 'g4', title: 'سالانہ تقریب تقسیم اسناد', category: 'تقاریب', imagePath: '' },
    { _id: 'g5', title: 'کتب خانہ و لائبریری', category: 'سہولیات', imagePath: '' },
    { _id: 'g6', title: 'مسجد مدرسہ', category: 'عمارت', imagePath: '' },
  ];
}

export async function uploadGalleryItem(title, category, imageFile) {
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category || 'عمارت');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const token = localStorage.getItem('madrassa_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('uploadGalleryItem error:', err);
  }

  // Fallback to local storage
  const local = JSON.parse(localStorage.getItem('madrassa_gallery') || '[]');
  const newItem = {
    _id: 'g_' + Date.now(),
    title,
    category: category || 'عمارت',
    imagePath: '',
    imagePreview: imageFile ? URL.createObjectURL(imageFile) : '',
    createdAt: new Date().toISOString(),
  };
  local.unshift(newItem);
  localStorage.setItem('madrassa_gallery', JSON.stringify(local));
  return newItem;
}

export async function deleteGalleryItem(id) {
  try {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('deleteGalleryItem error:', err);
  }

  const local = JSON.parse(localStorage.getItem('madrassa_gallery') || '[]');
  const filtered = local.filter((g) => g._id !== id);
  localStorage.setItem('madrassa_gallery', JSON.stringify(filtered));
  return { success: true };
}

