import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TermsPage from './pages/TermsPage';
import { Loader2 } from 'lucide-react';

const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const PrincipalDashboard = lazy(() => import('./pages/PrincipalDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const FullPageLoader = () => (
  <div className="flex min-h-[70dvh] items-center justify-center">
    <Loader2 className="animate-spin text-primary" size={32} />
  </div>
);

const dashboards = {
  student: { component: StudentDashboard, loginPath: '/login' },
  teacher: { component: TeacherDashboard, loginPath: '/teacher-login' },
  principal: { component: PrincipalDashboard, loginPath: '/principal-login' },
  admin: { component: AdminDashboard, loginPath: '/admin-login' }
};

const PortalRoute = ({ role }) => {
  const { user, loading } = useContext(AuthContext);
  const entry = dashboards[role];

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to={entry.loginPath} replace />;
  if (user.role.toLowerCase() !== role) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;

  const Component = entry.component;
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Component />
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#16213A',
              color: '#F8FAFC',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.875rem',
              maxWidth: '90vw'
            }
          }}
        />

        <div className="min-h-[100dvh] bg-background text-white font-sans">
          <Navbar />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route path="/login" element={<LoginPage role="student" />} />
            <Route path="/register" element={<Suspense fallback={<FullPageLoader />}><RegisterPage role="student" /></Suspense>} />

            <Route path="/teacher-login" element={<LoginPage role="teacher" title="Teacher sign in" />} />
            <Route
              path="/teacher-register"
              element={<Suspense fallback={<FullPageLoader />}><RegisterPage role="teacher" /></Suspense>}
            />

            <Route path="/principal-login" element={<LoginPage role="principal" title="Principal sign in" />} />

            <Route path="/admin-login" element={<LoginPage role="admin" title="Administrator sign in" />} />

            <Route path="/student/*" element={<PortalRoute role="student" />} />
            <Route path="/teacher/*" element={<PortalRoute role="teacher" />} />
            <Route path="/principal/*" element={<PortalRoute role="principal" />} />
            <Route path="/admin/*" element={<PortalRoute role="admin" />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <AIAssistant />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
