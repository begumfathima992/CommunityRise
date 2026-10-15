import { Container } from 'react-bootstrap';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FullPageSpinner from '../FullPageSpinner';

/** Admins only: guests go to /login; other users see a 403 message. */
export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== 'admin') {
    return (
      <section className="page-hero bg-pale-brand text-center">
        <Container>
          <h1 style={{ fontSize: 34 }}>Admins only</h1>
          <p style={{ color: 'var(--muted)' }}>You don't have permission to view this page.</p>
        </Container>
      </section>
    );
  }
  return <Outlet />;
}
