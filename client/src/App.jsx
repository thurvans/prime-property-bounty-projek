import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import PublicLayout from './components/PublicLayout.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PropertiesPage from './pages/PropertiesPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import AuditLogPage from './pages/AuditLogPage.jsx';
import ArchivePage from './pages/ArchivePage.jsx';

function RevealObserver() {
  const location = useLocation();

  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [location.pathname]);

  return null;
}

function ProtectedRoute({ children, superadminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-prime-gray text-prime-black">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-prime-gold" />
      </div>
    );
  }

  if (!user) return <Navigate to="/agent/login" replace />;
  if (superadminOnly && user.role !== 'superadmin') return <Navigate to="/agent/properties" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <RevealObserver />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route path="/agent/login" element={<LoginPage />} />
        <Route
          path="/agent"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/agent/properties" replace />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route
            path="admins"
            element={
              <ProtectedRoute superadminOnly>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="audit"
            element={
              <ProtectedRoute superadminOnly>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="archive"
            element={
              <ProtectedRoute superadminOnly>
                <ArchivePage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
