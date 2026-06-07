import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TermsPage from './pages/TermsPage';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, role, loginPath = '/login' }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to={loginPath} />;
  if (role && user.role.toLowerCase() !== role.toLowerCase()) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <div className="min-h-screen bg-background text-white font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Student Routes */}
            <Route path="/login" element={<LoginPage role="student" />} />
            <Route path="/register" element={<RegisterPage role="student" />} />
            <Route path="/student/*" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />

            {/* Teacher Routes */}
            <Route path="/teacher-panel" element={<LoginPage role="teacher" title="Teacher Login" />} />
            <Route path="/teacher-login" element={<LoginPage role="teacher" title="Teacher Login" />} />
            <Route path="/teacher-register" element={<RegisterPage role="teacher" />} />
            <Route path="/teacher/*" element={<ProtectedRoute role="teacher" loginPath="/teacher-login"><TeacherDashboard /></ProtectedRoute>} />

            {/* Principal Routes */}
            <Route path="/principal-panel" element={<LoginPage role="principal" title="Principal Login" />} />
            <Route path="/principal-login" element={<LoginPage role="principal" title="Principal Login" />} />
            <Route path="/principal-register" element={<RegisterPage role="principal" />} />
            <Route path="/principal/*" element={<ProtectedRoute role="principal" loginPath="/principal-login"><PrincipalDashboard /></ProtectedRoute>} />

            {/* Admin Route (No Register) */}
            <Route path="/admin-root" element={<LoginPage role="admin" title="System Admin" />} />
            <Route path="/admin-login" element={<LoginPage role="admin" title="System Admin" />} />
            <Route path="/admin/*" element={<ProtectedRoute role="admin" loginPath="/admin-root"><AdminDashboard /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <AIAssistant />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
