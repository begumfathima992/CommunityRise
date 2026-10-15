import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { safeRedirectPath } from '../../utils/redirect';
import FullPageSpinner from '../FullPageSpinner';

/** Login/register pages: logged-in users are sent on to the dashboard. */
export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to={safeRedirectPath(location.state?.from)} replace />;
  return <Outlet />;
}
