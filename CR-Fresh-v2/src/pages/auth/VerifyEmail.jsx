import { useEffect, useRef, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as authApi from '../../api/auth';
import { applyServerFieldErrors, getErrorMessage } from '../../api/errors';
import AuthLayout from '../../components/auth/AuthLayout';
import FormStatus from '../../components/auth/FormStatus';
import SubmitButton from '../../components/auth/SubmitButton';
import TextField from '../../components/auth/TextField';
import { useAuth } from '../../context/AuthContext';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { emailOnlySchema } from '../../validation/authSchemas';

const INVALID_LINK = 'This verification link is invalid or has expired.';

export default function VerifyEmail() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Read once, then drop the token from the address bar and history.
  const [token] = useState(() => searchParams.get('token') || '');
  const [status, setStatus] = useState(token ? 'verifying' : 'error'); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState(token ? '' : INVALID_LINK);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    navigate('/verify-email', { replace: true });

    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((error) => {
        setErrorMessage(getErrorMessage(error, { 400: INVALID_LINK, 422: INVALID_LINK }));
        setStatus('error');
      });
  }, [token, navigate]);

  // If the user is logged in, update their verified status (removes the banner).
  useEffect(() => {
    if (status === 'success' && user && !user.is_email_verified) {
      refreshUser().catch(() => {});
    }
  }, [status, user, refreshUser]);

  if (status === 'verifying') {
    return (
      <AuthLayout eyebrow="Email verification" title="Verifying your email…">
        <div className="d-flex align-items-center gap-3" role="status" aria-live="polite">
          <Spinner animation="border" size="sm" style={{ color: 'var(--sky-deep)' }} aria-hidden="true" />
          <span>Please wait while we confirm your email address.</span>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <AuthLayout eyebrow="Email verification" title="Email verified">
        <FormStatus variant="success" message="Thank you — your email address has been verified." />
        <Button as={Link} to={user ? '/dashboard' : '/login'} className="btn-navajo w-100">
          {user ? 'Go to your dashboard' : 'Log in'}
        </Button>
      </AuthLayout>
    );
  }

  const alreadyVerified = Boolean(user?.is_email_verified);

  return (
    <AuthLayout eyebrow="Email verification" title={alreadyVerified ? 'Email already verified' : 'Link not valid'}>
      {alreadyVerified ? (
        <>
          <FormStatus variant="success" message="Your email address is already verified. No further action is needed." />
          <Button as={Link} to="/dashboard" className="btn-navajo w-100">
            Go to your dashboard
          </Button>
        </>
      ) : (
        <>
          <FormStatus variant="warning" message={`${errorMessage} You can request a new link below.`} />
          <ResendVerification email={user?.email} />
        </>
      )}
    </AuthLayout>
  );
}

function ResendVerification({ email }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(emailOnlySchema),
    mode: 'onTouched',
    values: { email: email || '' },
  });

  const onSubmit = useSubmitLock(async (values) => {
    setError('');
    setMessage('');
    try {
      const res = await authApi.resendVerification(values.email);
      setMessage(res.message);
    } catch (err) {
      applyServerFieldErrors(err, setFieldError, ['email']);
      setError(
        getErrorMessage(err, {
          429: 'You have requested several verification emails recently. Please wait an hour and try again.',
        }),
      );
    }
  });

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Resend verification email">
      <FormStatus message={error} />
      <FormStatus variant="success" message={message} />
      {!email && (
        <TextField
          id="resend-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.email?.message}
          {...register('email')}
        />
      )}
      <SubmitButton pending={isSubmitting} pendingLabel="Sending…">
        Resend verification email
      </SubmitButton>
    </Form>
  );
}
