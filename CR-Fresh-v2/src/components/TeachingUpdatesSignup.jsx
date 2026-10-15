import { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import { useAuth } from '../context/AuthContext';

export const TEACHING_RESOURCES_PATH = '/get-involved/teaching-resources';

/**
 * "Sign-up to hear about the newest teaching resources".
 * Logged out: sign up / log in (then return here). Logged in: an explicit
 * opt-in button, or confirmation if already opted in.
 */
export default function TeachingUpdatesSignup() {
  const { user, loading, updatePreferences } = useAuth();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const returnTo = { from: { pathname: location.pathname, hash: '#sign-up' } };

  const optIn = async () => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await updatePreferences({ teaching_updates: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  let content;
  if (loading) {
    content = <Spinner animation="border" size="sm" style={{ color: 'var(--navajo)' }} aria-label="Loading" />;
  } else if (!user) {
    content = (
      <>
        <p className="signup-band-text">
          Create a Community Rise account and tick the box to get an email whenever we publish new lessons,
          assemblies and activities.
        </p>
        <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
          <Button as={Link} to="/register?interest=teaching-resources" state={returnTo} className="btn-navajo">
            Sign up for updates
          </Button>
          <span className="signup-band-text mb-0">
            Already have an account?{' '}
            <Link to="/login" state={returnTo} className="signup-band-link">
              Log in
            </Link>
          </span>
        </div>
      </>
    );
  } else if (user.teaching_updates_opt_in) {
    content = (
      <>
        <p className="signup-band-text">
          You're signed up, {user.full_name.trim().split(/\s+/)[0]}. We'll email <strong>{user.email}</strong> when new
          teaching resources are published.
        </p>
        <Link to="/account" className="signup-band-link">
          Change your email preferences
        </Link>
      </>
    );
  } else {
    content = (
      <>
        <p className="signup-band-text">
          You're logged in as <strong>{user.email}</strong>. Would you like an email when we publish new teaching
          resources?
        </p>
        <Button type="button" className="btn-navajo" onClick={optIn} disabled={pending} aria-busy={pending}>
          {pending ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />
              Signing you up…
            </>
          ) : (
            'Email me new teaching resources'
          )}
        </Button>
      </>
    );
  }

  return (
    <div className="signup-band" aria-labelledby="sign-up-heading">
      <p className="section-eyebrow" style={{ color: 'var(--navajo)' }}>
        Stay in the loop
      </p>
      <h2 id="sign-up-heading" style={{ color: 'var(--white)', fontSize: 'clamp(24px, 3.5vw, 30px)' }}>
        Sign-up to hear about the newest teaching resources
      </h2>
      <div aria-live="polite">{content}</div>
      <div aria-live="assertive">{error && <p className="signup-band-error mb-0 mt-3">{error}</p>}</div>
    </div>
  );
}
