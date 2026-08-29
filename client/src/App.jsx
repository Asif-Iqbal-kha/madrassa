import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import DashboardLayout from './components/common/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import NewsPopup from './components/common/NewsPopup';
import ScrollToTop from './components/common/ScrollToTop';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import AdmissionPage from './pages/public/AdmissionPage';
import DonationPage from './pages/public/DonationPage';
import TrackingPage from './pages/public/TrackingPage';
import ExamsPage from './pages/public/ExamsPage';
import ResultPage from './pages/public/ResultPage';
import NewsPage from './pages/public/NewsPage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageClasses from './pages/admin/ManageClasses';
import PromoteStudents from './pages/admin/PromoteStudents';
import ManageNews from './pages/admin/ManageNews';
import ManageGallery from './pages/admin/ManageGallery';
import ManageDonations from './pages/admin/ManageDonations';
import ManageAdmissions from './pages/admin/ManageAdmissions';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import AttendanceHistory from './pages/teacher/AttendanceHistory';
import UploadResults from './pages/teacher/UploadResults';

// Public layout wrapper
function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NewsPopup />
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admission" element={<AdmissionPage />} />
            <Route path="/donation" element={<DonationPage />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/results" element={<ResultPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['master_admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="teachers" element={<ManageTeachers />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="promote" element={<PromoteStudents />} />
            <Route path="donations" element={<ManageDonations />} />
            <Route path="admissions" element={<ManageAdmissions />} />
            <Route path="news" element={<ManageNews />} />
            <Route path="gallery" element={<ManageGallery />} />
          </Route>

          {/* Teacher Dashboard */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute roles={['teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="attendance" element={<MarkAttendance />} />
            <Route path="attendance-history" element={<AttendanceHistory />} />
            <Route path="results" element={<UploadResults />} />
          </Route>

          {/* Catch-all: redirect any student or unknown paths to home to prevent blank white screens */}
          <Route path="/student/*" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
