// Centralized API Service for Madrassa Application
// 100% connected directly to MongoDB Atlas Backend for Authentication, Students, Teachers,
// Classes, News, Attendance, Exams, Results, Donations, Admissions, and Stats.

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('madrassa_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Helper: throw a proper error from a non-ok response
async function handleResponse(res) {
  if (res.ok) return res.json();
  let msg = `HTTP ${res.status}`;
  try {
    const data = await res.json();
    msg = data.message || msg;
  } catch {}
  throw new Error(msg);
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
    console.warn('Backend login offline:', err);
    return { success: false, message: 'سرور سے رابطہ نہیں ہو سکا' };
  }
}

export async function getUserProfile() {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
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
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('getStudents failed:', err);
  }
  return [];
}

// Throws on failure — caller must handle and show error to user
export async function createStudent(studentData) {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });
  return handleResponse(res);
}

// Throws on failure
export async function updateStudent(id, studentData) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });
  return handleResponse(res);
}

// Throws on failure — caller must handle and show error to user
export async function deleteStudent(id) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function promoteStudents(studentIds, toClassName, toClassId) {
  try {
    const res = await fetch(`${API_BASE}/students/promote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentIds, toClassName, toClassId }),
    });
    const data = await res.json();
    if (res.ok) return data;
    return { success: false, message: data.message || 'ترقی دینے میں خرابی ہوئی' };
  } catch (err) {
    console.warn('promoteStudents API failed:', err);
    return { success: false, message: 'سرور سے رابطہ نہیں ہو سکا' };
  }
}

// ----------------- TEACHERS API -----------------

export async function getTeachers() {
  try {
    const res = await fetch(`${API_BASE}/teachers`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getTeachers failed:', err);
  }
  return [];
}

// Throws on failure
export async function createTeacher(teacherData) {
  const res = await fetch(`${API_BASE}/teachers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(teacherData),
  });
  return handleResponse(res);
}

// Throws on failure
export async function updateTeacher(id, teacherData) {
  const res = await fetch(`${API_BASE}/teachers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(teacherData),
  });
  return handleResponse(res);
}

// Throws on failure
export async function deleteTeacher(id) {
  const res = await fetch(`${API_BASE}/teachers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// ----------------- CLASSES API -----------------

export async function getClasses() {
  try {
    const res = await fetch(`${API_BASE}/classes`, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getClasses failed:', err);
  }
  return [];
}

// Throws on failure
export async function createClass(classData) {
  const res = await fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(classData),
  });
  return handleResponse(res);
}

// Throws on failure
export async function updateClass(id, classData) {
  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(classData),
  });
  return handleResponse(res);
}

// Throws on failure
export async function deleteClass(id) {
  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// ----------------- NEWS API -----------------

export async function getNews(publishedOnly = true) {
  try {
    const url = publishedOnly ? `${API_BASE}/news` : `${API_BASE}/news?published=all`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getNews failed:', err);
  }
  return [];
}

// Throws on failure
export async function createNews(newsData) {
  const res = await fetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...newsData, isPublished: true, publishDate: new Date().toISOString().split('T')[0] }),
  });
  return handleResponse(res);
}

// Throws on failure
export async function updateNews(id, newsData) {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(newsData),
  });
  return handleResponse(res);
}

// Throws on failure
export async function deleteNews(id) {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// Get active popup news (public, no auth)
export async function getPopupNews() {
  try {
    const res = await fetch(`${API_BASE}/news/popup`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getPopupNews failed:', err);
  }
  return [];
}

// Admin: toggle popup on/off for a news item
export async function toggleNewsPopup(id, isPopup) {
  const res = await fetch(`${API_BASE}/news/${id}/popup`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isPopup }),
  });
  return handleResponse(res);
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
  return { totalDays: 0, presentDays: 0, absentDays: 0, leaveDays: 0, percentage: 0 };
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
  return [];
}

export async function createExam(examData) {
  const res = await fetch(`${API_BASE}/exams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });
  return handleResponse(res);
}

export async function updateExam(id, examData) {
  const res = await fetch(`${API_BASE}/exams/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });
  return handleResponse(res);
}

export async function deleteExam(id) {
  const res = await fetch(`${API_BASE}/exams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function getResults(examId, classId) {
  try {
    let url = `${API_BASE}/results`;
    const params = new URLSearchParams();
    if (examId) params.append('examId', examId);
    if (classId) params.append('classId', classId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getResults failed:', err);
  }
  return [];
}

export async function saveResults(resultsData) {
  const res = await fetch(`${API_BASE}/results`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resultsData),
  });
  return handleResponse(res);
}

export async function uploadResult(resultData) {
  const res = await fetch(`${API_BASE}/results`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resultData),
  });
  return handleResponse(res);
}

export async function getStudentResults(studentId) {
  try {
    const res = await fetch(`${API_BASE}/results/student/${studentId}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getStudentResults error:', err);
  }
  return [];
}

export async function searchStudentResult(rollNumber, examType) {
  try {
    let url = `${API_BASE}/results/search?rollNumber=${encodeURIComponent(rollNumber.trim())}`;
    if (examType && examType !== 'all') {
      url += `&examType=${encodeURIComponent(examType)}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    const data = await res.json().catch(() => ({}));
    return { error: data.message || `رول نمبر ${rollNumber} کا رزلٹ نہیں ملا` };
  } catch (err) {
    console.warn('searchStudentResult API error:', err);
    return { error: 'سرور سے رابطہ نہیں ہو سکا' };
  }
}

// ----------------- STATS API -----------------

export async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('getStats failed:', err);
  }

  return {
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    todayAttendance: 0,
    attendancePercentage: 0,
    pendingDonations: 0,
    pendingAdmissions: 0,
  };
}

// ----------------- DONATIONS API -----------------

export async function submitDonation(donationData, screenshotFile) {
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
  const errData = await res.json().catch(() => ({}));
  return { success: false, message: errData.message || 'عطیہ جمع کرنے میں خرابی' };
}

export async function getDonations(statusFilter = 'all') {
  try {
    const url = statusFilter !== 'all'
      ? `${API_BASE}/donations?status=${statusFilter}`
      : `${API_BASE}/donations`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getDonations API error:', err);
  }
  return [];
}

export async function updateDonationStatus(id, newStatus, adminNotes = '') {
  const res = await fetch(`${API_BASE}/donations/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: newStatus, adminNotes }),
  });
  return handleResponse(res);
}

export async function trackDonation(trackingNumber) {
  try {
    const res = await fetch(`${API_BASE}/donations/track/${encodeURIComponent(trackingNumber)}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('trackDonation API error:', err);
  }
  return null;
}

// ----------------- ADMISSIONS API -----------------

export async function submitAdmission(admissionData, paymentProofFile) {
  const formData = new FormData();
  Object.keys(admissionData).forEach((key) => {
    if (admissionData[key] !== undefined && admissionData[key] !== null) {
      formData.append(key, admissionData[key]);
    }
  });
  if (paymentProofFile) {
    formData.append('paymentProof', paymentProofFile);
  }

  const res = await fetch(`${API_BASE}/admissions`, {
    method: 'POST',
    body: formData,
  });

  if (res.ok) {
    const data = await res.json();
    return {
      success: true,
      trackingNumber: data.trackingNumber,
      queuePosition: data.queuePosition,
      message: data.message,
    };
  }
  const errData = await res.json().catch(() => ({}));
  return { success: false, message: errData.message || 'درخواست جمع کرنے میں خرابی' };
}

export async function getAdmissions(statusFilter = 'all') {
  try {
    const url = statusFilter !== 'all'
      ? `${API_BASE}/admissions?status=${statusFilter}`
      : `${API_BASE}/admissions`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getAdmissions API error:', err);
  }
  return [];
}

export async function updateAdmissionStatus(id, newStatus, adminNotes = '') {
  const res = await fetch(`${API_BASE}/admissions/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: newStatus, adminNotes }),
  });
  return handleResponse(res);
}

export async function trackAdmission(trackingNumber) {
  try {
    const res = await fetch(`${API_BASE}/admissions/track/${encodeURIComponent(trackingNumber)}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('trackAdmission API error:', err);
  }
  return null;
}

// ----------------- GALLERY API -----------------

export async function getGalleryItems() {
  try {
    const res = await fetch(`${API_BASE}/gallery`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getGalleryItems error:', err);
  }
  return [];
}

export async function uploadGalleryItem(title, category, imageFile) {
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

  return handleResponse(res);
}

export async function deleteGalleryItem(id) {
  const res = await fetch(`${API_BASE}/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
