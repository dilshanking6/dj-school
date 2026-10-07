import React, { Suspense, lazy, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Landing page GSAP + ScrollTrigger laata hai (~70 KB gzip), aur Login/Terms
// page framer-motion. Pehle ye sab eager import the, isliye har visitor —
// chahe wo seedha /login par aaye — poora 570 KB ka bundle download karta tha.
// Ab sirf wahi chunk jo sach me chahiye uthta hai.
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

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

const ThemedToaster = () => {
  const { isLight } = useTheme();
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: isLight
          ? {
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid rgba(15,23,42,0.12)',
              fontSize: '0.875rem',
              maxWidth: '90vw'
            }
          : {
              background: '#16213A',
              color: '#F8FAFC',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.875rem',
              maxWidth: '90vw'
            }
      }}
    />
  );
};

const PortalRoute = ({ role }) => {
  const { user, loading } = useContext(AuthContext);
  const entry = dashboards[role];

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to={entry.loginPath} replace />;
  if (user.role.toLowerCase() !== role) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;

  const Component = entry.component;
  return <Component />;
};

function App({ onReady }) {
  // `index.html` ka boot splash hatane ka signal. Ye sirf tab chalta hai jab
  // app sach me render ho rahi ho — Splash hata dena aur phir crash hona
  // dono ek saath nahi hona chahiye, warna user ko ek blank screen mil jayega.
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ThemedToaster />

          <div className="min-h-[100dvh] bg-background text-white font-sans">
            <Navbar />

            {/* Ek boundary poori app ke bahar + ek routes ke andar. Bahar wala
                theme/router crash pakadta hai, andar wala sirf ek page ka. */}
            <ErrorBoundary>
              <Suspense fallback={<FullPageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  <Route path="/login" element={<LoginPage role="student" />} />
                  <Route path="/register" element={<RegisterPage role="student" />} />

                  <Route path="/teacher-login" element={<LoginPage role="teacher" title="Teacher sign in" />} />
                  <Route path="/teacher-register" element={<RegisterPage role="teacher" />} />

                  <Route path="/principal-login" element={<LoginPage role="principal" title="Principal sign in" />} />
                  <Route path="/admin-login" element={<LoginPage role="admin" title="Administrator sign in" />} />

                  <Route path="/student/*" element={<PortalRoute role="student" />} />
                  <Route path="/teacher/*" element={<PortalRoute role="teacher" />} />
                  <Route path="/principal/*" element={<PortalRoute role="principal" />} />
                  <Route path="/admin/*" element={<PortalRoute role="admin" />} />

                  {/* Pehle yahan silent redirect tha. Ab asli 404 page. */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>

                <AIAssistant />
              </Suspense>
            </ErrorBoundary>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
