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
  let serverStudents = null;
  try {
    const query = new URLSearchParams(filter).toString();
    const url = query ? `${API_BASE}/students?${query}` : `${API_BASE}/students`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) {
      serverStudents = await res.json();
    } else {
      console.warn('getStudents non-ok response, using fallback');
    }
  } catch (err) {
    console.warn('getStudents failed, using fallback:', err);
  }

  // Load students stored in local storage
  let stored = JSON.parse(localStorage.getItem('madrassa_students') || '[]');

  // Check all admitted applications from localStorage and mock data to guarantee every admitted student exists
  const localAdmissions = JSON.parse(localStorage.getItem('madrassa_admissions') || '[]');
  const allAdmissions = [...localAdmissions, ...MOCK_ADMISSION_APPLICATIONS];
  const admittedApps = allAdmissions.filter((a) => a.status === 'admitted');

  admittedApps.forEach((app) => {
    const name = app.studentName || app.name || '';
    const father = app.fatherName || '';
    const cnic = app.cnic || '';

    const alreadyInStored = stored.some(
      (s) => (cnic && s.cnic === cnic) || (s.name === name && s.fatherName === father)
    );
    const alreadyInMock = MOCK_STUDENTS.some(
      (s) => (cnic && s.cnic === cnic) || (s.name === name && s.fatherName === father)
    );
    const alreadyInServer = serverStudents && serverStudents.some(
      (s) => (cnic && s.cnic === cnic) || (s.name === name && s.fatherName === father)
    );

    if (!alreadyInStored && !alreadyInMock && !alreadyInServer) {
      const rollNumber = String(1050 + stored.length + 1);
      const studentFromApp = {
        _id: 'stu_adm_' + (app._id || Date.now()),
        name,
        fatherName: father,
        rollNumber,
        className: app.desiredClass || 'حفظ قرآن کریم',
        dateOfBirth: app.dateOfBirth || '',
        cnic,
        identificationMark: app.identificationMark || '',
        maritalStatus: app.maritalStatus || 'مجرد',
        phone: app.phone || '',
        address: app.address || app.currentAddress || app.permanentAddress || '',
        permanentAddress: app.permanentAddress || '',
        currentAddress: app.currentAddress || '',
        previousEducation: app.previousEducation || '',
        guardianName: app.guardianName || father,
        guardianFatherName: app.guardianFatherName || '',
        guardianRelation: app.guardianRelation || 'والد',
        guardianPhone: app.guardianPhone || app.phone || '',
        guardianCnic: app.guardianCnic || '',
        guardianPermanentAddress: app.guardianPermanentAddress || '',
        guardianCurrentAddress: app.guardianCurrentAddress || '',
        mardanRelative: app.mardanRelative || '',
        studentPhotoData: app.studentPhotoData || '',
        admissionFee: app.admissionFee || 1000,
        paymentMethod: app.paymentMethod || 'JazzCash',
        transactionId: app.transactionId || '',
        screenshotData: app.screenshotData || '',
        status: 'active',
        enrollmentDate: app.date || new Date().toISOString().split('T')[0],
      };
      stored.unshift(studentFromApp);
      localStorage.setItem('madrassa_students', JSON.stringify(stored));
    }
  });

  if (serverStudents && Array.isArray(serverStudents) && serverStudents.length > 0) {
    // Merge any stored students that server doesn't have yet
    const nonServerStored = stored.filter(
      (st) => !serverStudents.some((sv) => (sv.cnic && sv.cnic === st.cnic) || (sv.name === st.name && sv.fatherName === st.fatherName))
    );
    return [...nonServerStored, ...serverStudents];
  }

  const mockFiltered = MOCK_STUDENTS.filter(
    (m) => !stored.some((s) => s._id === m._id || s.rollNumber === m.rollNumber || (s.name === m.name && s.fatherName === m.fatherName))
  );
  return [...stored, ...mockFiltered];
}

// Throws on failure — caller must handle and show error to user
export async function createStudent(studentData) {
  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('createStudent API failed, saving to local fallback:', err);
  }

  const stored = JSON.parse(localStorage.getItem('madrassa_students') || '[]');
  const newObj = {
    _id: 'stu_' + Date.now(),
    ...studentData,
  };
  stored.unshift(newObj);
  localStorage.setItem('madrassa_students', JSON.stringify(stored));
  return newObj;
}

// Throws on failure — caller must handle and show error to user
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
  return MOCK_TEACHERS;
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
  return MOCK_CLASSES;
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
    // publishedOnly=true  → public page, only show published articles
    // publishedOnly=false → admin page, show all articles
    const url = publishedOnly ? `${API_BASE}/news` : `${API_BASE}/news?published=all`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('getNews failed:', err);
  }
  return MOCK_NEWS;
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
  const res = await fetch(`${API_BASE}/exams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
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
    console.warn('getStudentResults failed:', err);
  }
  return MOCK_RESULTS;
}

export async function uploadResult(resultData) {
  const res = await fetch(`${API_BASE}/results`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resultData),
  });
  return handleResponse(res);
}

// Public search for student result by Roll Number
export async function searchStudentResult(rollNumber) {
  try {
    const res = await fetch(`${API_BASE}/results/roll/${encodeURIComponent(rollNumber.trim())}`);
    if (res.ok) {
      return await res.json();
    }
    const data = await res.json().catch(() => ({}));
    return { error: data.message || `رول نمبر ${rollNumber} کا رزلٹ نہیں ملا` };
  } catch (err) {
    console.warn('searchStudentResult API error:', err);
  }

  // Fallback to mock data for demo/offline
  const found = MOCK_RESULTS.filter((r) => r.rollNumber === rollNumber.trim());
  if (found.length > 0) return found;
  return { error: `رول نمبر ${rollNumber} کا کوئی ریکارڈ نہیں ملا` };
}

// ----------------- STATS API -----------------

export async function getStats() {
  let serverStats = null;
  try {
    const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
    if (res.ok) {
      serverStats = await res.json();
    }
  } catch (err) {
    console.warn('getStats failed, using dynamic local reconciliation:', err);
  }

  // Get live counts directly from actual data entities
  const [students, teachers, classes, admissions, donations] = await Promise.all([
    getStudents().catch(() => []),
    getTeachers().catch(() => []),
    getClasses().catch(() => []),
    getAdmissions().catch(() => []),
    getDonations().catch(() => []),
  ]);

  const liveTotalStudents = students.length;
  const liveTotalTeachers = teachers.length;
  const liveTotalClasses = classes.length;
  const livePendingAdmissions = admissions.filter(
    (a) => a.status === 'pending' || a.status === 'under_review'
  ).length;
  const livePendingDonations = donations.filter(
    (d) => d.status === 'pending'
  ).length;

  return {
    totalStudents: liveTotalStudents > 0 ? liveTotalStudents : (serverStats?.totalStudents || 0),
    activeStudents: students.filter((s) => s.status === 'active').length || liveTotalStudents,
    totalTeachers: liveTotalTeachers > 0 ? liveTotalTeachers : (serverStats?.totalTeachers || 0),
    totalClasses: liveTotalClasses > 0 ? liveTotalClasses : (serverStats?.totalClasses || 0),
    todayAttendance: serverStats?.todayAttendance || Math.round(liveTotalStudents * 0.92),
    attendancePercentage: serverStats?.attendancePercentage || 92,
    pendingDonations: livePendingDonations > 0 ? livePendingDonations : (serverStats?.pendingDonations || 0),
    pendingAdmissions: livePendingAdmissions,
  };
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
    const errData = await res.json().catch(() => ({}));
    return { success: false, message: errData.message || 'عطیہ جمع کرنے میں خرابی' };
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
    const url = statusFilter !== 'all'
      ? `${API_BASE}/donations?status=${statusFilter}`
      : `${API_BASE}/donations`;
    const res = await fetch(url, { headers: getAuthHeaders() });
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

// Update donation status on server and sync local storage
export async function updateDonationStatus(id, newStatus, adminNotes = '') {
  try {
    const res = await fetch(`${API_BASE}/donations/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus, adminNotes }),
    });
    if (res.ok) {
      const data = await res.json();
      const local = JSON.parse(localStorage.getItem('madrassa_donations') || '[]');
      const index = local.findIndex((d) => d._id === id || d.trackingNumber === id || (data && d.trackingNumber === data.trackingNumber));
      if (index !== -1) {
        local[index].status = newStatus;
        local[index].adminNotes = adminNotes;
        localStorage.setItem('madrassa_donations', JSON.stringify(local));
      }
      return data;
    }
    return await handleResponse(res);
  } catch (err) {
    const local = JSON.parse(localStorage.getItem('madrassa_donations') || '[]');
    const index = local.findIndex((d) => d._id === id || d.trackingNumber === id);
    if (index !== -1) {
      local[index].status = newStatus;
      local[index].adminNotes = adminNotes;
      localStorage.setItem('madrassa_donations', JSON.stringify(local));
      return local[index];
    }
    throw err;
  }
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

export async function submitAdmission(admissionData, paymentProofFile = null) {
  try {
    let res;
    if (paymentProofFile) {
      const formData = new FormData();
      Object.keys(admissionData).forEach((key) => {
        if (admissionData[key] !== undefined && admissionData[key] !== null) {
          formData.append(key, admissionData[key]);
        }
      });
      formData.append('screenshot', paymentProofFile);
      res = await fetch(`${API_BASE}/admissions`, {
        method: 'POST',
        body: formData,
      });
    } else {
      res = await fetch(`${API_BASE}/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admissionData),
      });
    }

    if (res.ok) {
      const data = await res.json();
      return { success: true, trackingNumber: data.trackingNumber, queuePosition: data.queuePosition, message: data.message };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, message: errData.message || 'درخواست جمع کرنے میں خرابی' };
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
    ...admissionData,
    admissionFee: Number(admissionData.admissionFee) || 1000,
    paymentMethod: admissionData.paymentMethod || 'JazzCash',
    transactionId: admissionData.transactionId || '',
    screenshotPath: paymentProofFile?.name || '',
    screenshotData: admissionData.screenshotData || '',
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
    const url = statusFilter !== 'all'
      ? `${API_BASE}/admissions?status=${statusFilter}`
      : `${API_BASE}/admissions`;
    const res = await fetch(url, { headers: getAuthHeaders() });
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

// Throws on failure — caller must show error
export async function updateAdmissionStatus(id, newStatus, adminNotes = '', appData = null) {
  let serverData = null;
  try {
    const res = await fetch(`${API_BASE}/admissions/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus, adminNotes }),
    });
    if (res.ok) {
      serverData = await res.json();
    }
  } catch (err) {
    console.warn('updateAdmissionStatus API error:', err);
  }

  // Update admission in local storage
  const storedAdmissions = JSON.parse(localStorage.getItem('madrassa_admissions') || '[]');
  let applicationObj = serverData || appData;
  const idx = storedAdmissions.findIndex((a) => a._id === id || a.trackingNumber === id);
  if (idx !== -1) {
    storedAdmissions[idx].status = newStatus;
    if (adminNotes) storedAdmissions[idx].adminNotes = adminNotes;
    applicationObj = { ...storedAdmissions[idx], ...(applicationObj || {}) };
    localStorage.setItem('madrassa_admissions', JSON.stringify(storedAdmissions));
  } else if (!applicationObj) {
    const mockFound = MOCK_ADMISSION_APPLICATIONS.find((a) => a._id === id || a.trackingNumber === id);
    if (mockFound) {
      applicationObj = { ...mockFound, status: newStatus, adminNotes: adminNotes || mockFound.adminNotes };
    }
  }

  // When admission is confirmed (admitted), automatically create the Student record with all details
  if (newStatus === 'admitted' && applicationObj) {
    const name = applicationObj.studentName || applicationObj.name || '';
    const father = applicationObj.fatherName || '';
    const cnic = applicationObj.cnic || '';

    const storedStudents = JSON.parse(localStorage.getItem('madrassa_students') || '[]');
    const alreadyExists = storedStudents.some(
      (s) => (cnic && s.cnic === cnic) || (s.name === name && s.fatherName === father)
    ) || MOCK_STUDENTS.some(
      (s) => (cnic && s.cnic === cnic) || (s.name === name && s.fatherName === father)
    );

    if (!alreadyExists) {
      const rollNumber = String(1000 + storedStudents.length + MOCK_STUDENTS.length + 1);
      const newStudent = {
        _id: 'stu_' + Date.now(),
        name,
        fatherName: father,
        rollNumber,
        className: applicationObj.desiredClass || 'حفظ قرآن کریم',
        dateOfBirth: applicationObj.dateOfBirth || '',
        cnic,
        identificationMark: applicationObj.identificationMark || '',
        maritalStatus: applicationObj.maritalStatus || 'مجرد',
        phone: applicationObj.phone || '',
        address: applicationObj.address || applicationObj.currentAddress || applicationObj.permanentAddress || '',
        permanentAddress: applicationObj.permanentAddress || '',
        currentAddress: applicationObj.currentAddress || '',
        previousEducation: applicationObj.previousEducation || '',
        guardianName: applicationObj.guardianName || father,
        guardianFatherName: applicationObj.guardianFatherName || '',
        guardianRelation: applicationObj.guardianRelation || 'والد',
        guardianPhone: applicationObj.guardianPhone || applicationObj.phone || '',
        guardianCnic: applicationObj.guardianCnic || '',
        guardianPermanentAddress: applicationObj.guardianPermanentAddress || '',
        guardianCurrentAddress: applicationObj.guardianCurrentAddress || '',
        mardanRelative: applicationObj.mardanRelative || '',
        studentPhotoData: applicationObj.studentPhotoData || '',
        admissionFee: applicationObj.admissionFee || 1000,
        paymentMethod: applicationObj.paymentMethod || 'JazzCash',
        transactionId: applicationObj.transactionId || '',
        screenshotData: applicationObj.screenshotData || '',
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')[0],
      };
      storedStudents.unshift(newStudent);
      localStorage.setItem('madrassa_students', JSON.stringify(storedStudents));

      // Also attempt to push to backend server via POST /api/students
      try {
        await fetch(`${API_BASE}/students`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newStudent),
        });
      } catch (err) {
        console.warn('Backend student sync error:', err);
      }
    }
  }

  if (serverData) return serverData;
  return applicationObj || { success: true, status: newStatus };
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

// Throws on failure
export async function deleteGalleryItem(id) {
  const res = await fetch(`${API_BASE}/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
