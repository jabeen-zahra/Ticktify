import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * HomePage — Smart redirect based on auth state and role.
 * Acts as a post-login landing hub:
 *   - Unauthenticated → /
 *   - student         → /dashboard
 *   - organizer       → /organizer
 *   - admin           → /admin
 */
export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    const ROLE_ROUTES = {
      student:   '/dashboard',
      organizer: '/organizer',
      admin:     '/admin',
    };

    navigate(ROLE_ROUTES[user?.role] || '/', { replace: true });
  }, [isAuthenticated, loading, user, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <LoadingSpinner size="lg" text="Redirecting..." />
    </div>
  );
}
