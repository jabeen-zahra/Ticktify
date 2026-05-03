import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage           from './pages/LandingPage';
import LoginPage             from './pages/LoginPage';
import RegisterPage          from './pages/RegisterPage';
import ForgotPasswordPage    from './pages/ForgotPasswordPage';
import AdminDashboard        from './pages/AdminDashboard';
import OrganizerDashboard    from './pages/OrganizerDashboard';
import StudentDashboard      from './pages/StudentDashboard';
import OpportunitiesPage     from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import ProfileSettingsPage   from './pages/ProfileSettingsPage';
import HomePage              from './pages/HomePage';

import './styles/animations.css';
import './index.css';

// ── Loading fallback ──────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg-primary)',
    color: 'var(--text-muted)', fontFamily: 'Bricolage Grotesque, sans-serif',
    fontSize: '14px', letterSpacing: '0.05em',
  }}>
    Loading...
  </div>
);

// ── Requires any authenticated user ──────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ── Requires specific role ────────────────────────────────────────────────────
const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────── */}
      <Route path="/"                  element={<LandingPage />} />
      <Route path="/home"              element={<HomePage />} />
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/register"          element={<RegisterPage />} />
      <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
      <Route path="/opportunities"     element={<OpportunitiesPage />} />
      <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />

      {/* ── Protected — any authenticated user ─────────────────────────── */}
      <Route path="/settings" element={
        <PrivateRoute><ProfileSettingsPage /></PrivateRoute>
      } />

      {/* ── Role-protected ─────────────────────────────────────────────── */}
      <Route path="/dashboard" element={
        <PrivateRoute><StudentDashboard /></PrivateRoute>
      } />
      <Route path="/admin/*" element={
        <RoleRoute role="admin"><AdminDashboard /></RoleRoute>
      } />
      <Route path="/organizer/*" element={
        <RoleRoute role="organizer"><OrganizerDashboard /></RoleRoute>
      } />

      {/* ── Catch-all ──────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="landing-page">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--bg-elevated)',
                color:      'var(--text-primary)',
                border:     '1px solid var(--border)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize:   '14px',
              },
              success: { iconTheme: { primary: '#CBFF47', secondary: 'var(--bg-primary)' } },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;