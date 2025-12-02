import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from './utils/api';
import { Layout, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';

// Import Pages
import ModernLandingPage from './pages/ModernLandingPage';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import TeacherLogin from './pages/TeacherLogin';
import AdminLogin from './pages/AdminLogin';
import ApplicationFormPage from './pages/ApplicationFormPage';
import AdmissionManagement from './pages/AdmissionManagement';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminTeachersPage from './pages/AdminTeachersPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminSubjectsPage from './pages/AdminSubjectsPage';
import AdminAttendancePanel from './pages/AdminAttendancePanel';
import AdminFeesManagement from './pages/AdminFeesManagement';
import FeesPage from './pages/FeesPage';
import AttendancePage from './pages/AttendancePage';
import ExamsPage from './pages/ExamsPage';
import LMSPage from './pages/LMSPage';
import MessagesPage from './pages/MessagesPage';
import TimetablePage from './pages/TimetablePage';
import StudentProfile from './pages/StudentProfile';
import NoticesPage from './pages/NoticesPage';
import Sidebar from './components/Sidebar';
import StudentRegistrationFlow from './pages/StudentRegistrationFlow';
import StudentDashboardNew from './pages/StudentDashboardNew';
import TeacherDashboardNew from './pages/TeacherDashboardNew';
import AdminCoursesManagement from './pages/AdminCoursesManagement';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get('/auth/verify-token');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Navigation bar component
  return (
    <Router>
      {!user ? (
        <div className="main-content">
          <Routes>
            <Route path="/" element={<ModernLandingPage />} />
            <Route path="/login" element={<StudentLogin setUser={setUser} />} />
            <Route path="/register" element={<StudentRegister setUser={setUser} />} />
            <Route path="/register-flow" element={<StudentRegistrationFlow />} />
            <Route path="/teacher/login" element={<TeacherLogin setUser={setUser} />} />
            <Route path="/admin/login" element={<AdminLogin setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      ) : user.role === 'student' && user.applicationSubmitted === false ? (
        <Routes>
          <Route path="/application-form" element={<ApplicationFormPage user={user} />} />
          <Route path="/logout" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/application-form" />} />
        </Routes>
      ) : (
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar user={user} onLogout={handleLogout} />
          <Layout style={{ marginLeft: '200px' }}>
            <Routes>
              {user.role === 'student' && (
                <>
                  <Route path="/dashboard" element={<StudentDashboardNew user={user} />} />
                  <Route path="/dashboard-old" element={<StudentDashboard user={user} />} />
                  <Route path="/profile" element={<StudentProfile user={user} />} />
                  <Route path="/attendance" element={<AttendancePage user={user} />} />
                  <Route path="/exams" element={<ExamsPage user={user} />} />
                  <Route path="/fees" element={<FeesPage user={user} />} />
                  <Route path="/lms" element={<LMSPage user={user} />} />
                  <Route path="/messages" element={<MessagesPage user={user} />} />
                  <Route path="/timetable" element={<TimetablePage user={user} />} />
                  <Route path="/notices" element={<NoticesPage user={user} />} />
                </>
              )}
              {user.role === 'teacher' && (
                <>
                  <Route path="/dashboard" element={<TeacherDashboardNew user={user} />} />
                  <Route path="/dashboard-old" element={<TeacherDashboard user={user} />} />
                  <Route path="/attendance" element={<AttendancePage user={user} />} />
                  <Route path="/exams" element={<ExamsPage user={user} />} />
                  <Route path="/lms" element={<LMSPage user={user} />} />
                  <Route path="/messages" element={<MessagesPage user={user} />} />
                  <Route path="/timetable" element={<TimetablePage user={user} />} />
                </>
              )}
              {(user.role === 'admin' || user.role === 'superadmin') && (
                <>
                  <Route path="/dashboard" element={<AdminDashboard user={user} />} />
                  <Route path="/admissions" element={<AdmissionManagement user={user} />} />
                  <Route path="/students" element={<AdminStudentsPage user={user} />} />
                  <Route path="/teachers" element={<AdminTeachersPage user={user} />} />
                  <Route path="/courses" element={<AdminCoursesManagement user={user} />} />
                  <Route path="/courses-old" element={<AdminCoursesPage user={user} />} />
                  <Route path="/subjects" element={<AdminSubjectsPage user={user} />} />
                  <Route path="/attendance" element={<AdminAttendancePanel user={user} />} />
                  <Route path="/fees" element={<AdminFeesManagement user={user} />} />
                  <Route path="/exams" element={<ExamsPage user={user} />} />
                  <Route path="/messages" element={<MessagesPage user={user} />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Layout>
        </Layout>
      )}
    </Router>
  );
}

export default App;
