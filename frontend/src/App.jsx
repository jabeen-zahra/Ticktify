import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import AdminDashboard     from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import StudentDashboard   from './pages/StudentDashboard';
import OpportunitiesPage  from './pages/OpportunitiesPage';
import HomePage           from './pages/HomePage';

// Styles
import './styles/animations.css';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg-primary)',
      color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
      Loading...
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg-primary)',
      color:'var(--text-muted)' }}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<LandingPage />} />
      <Route path="/home"          element={<HomePage />} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/register"      element={<RegisterPage />} />
      <Route path="/opportunities" element={<OpportunitiesPage />} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <PrivateRoute><StudentDashboard /></PrivateRoute>
      }/>
      <Route path="/admin/*" element={
        <RoleRoute role="admin"><AdminDashboard /></RoleRoute>
      }/>
      <Route path="/organizer/*" element={
        <RoleRoute role="organizer"><OrganizerDashboard /></RoleRoute>
      }/>

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
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#CBFF47',
                  secondary: 'var(--bg-primary)',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;