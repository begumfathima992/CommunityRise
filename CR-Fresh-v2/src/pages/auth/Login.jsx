import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { applyServerFieldErrors, getErrorMessage, getStatus } from '../../api/errors';
import AuthLayout from '../../components/auth/AuthLayout';
import FormStatus from '../../components/auth/FormStatus';
import PasswordField from '../../components/auth/PasswordField';
import SubmitButton from '../../components/auth/SubmitButton';
import TextField from '../../components/auth/TextField';
import { useAuth } from '../../context/AuthContext';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { safeRedirectPath } from '../../utils/redirect';
import { loginSchema } from '../../validation/authSchemas';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState(null);

  // Messages passed from other pages (e.g. after a password reset).
  const notice =
    location.state?.message ||
    (location.state?.reason === 'session-expired' ? 'Your session has expired. Please log in again.' : '');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = useSubmitLock(async (values) => {
    setFormError(null);
    try {
      await login(values);
      navigate(safeRedirectPath(location.state?.from), { replace: true });
    } catch (error) {
      const status = getStatus(error);
      applyServerFieldErrors(error, setError, ['email', 'password']);
      setFormError({
        variant: status === 423 || status === 429 ? 'warning' : 'danger',
        locked: status === 423,
        title: status === 423 ? 'Account temporarily locked' : status === 429 ? 'Too many attempts' : null,
        message: getErrorMessage(error, {
          401: 'Invalid email or password.',
          429: 'Too many login attempts from your connection. Please wait 15 minutes and try again.',
        }),
      });
    }
  });

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in"
      footer={
        <>
          New to Community Rise?{' '}
          <Link to="/register" state={location.state} className="link-brand">
            Create an account
          </Link>
        </>
      }
    >
      <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Log in">
        <FormStatus message={notice && !formError ? notice : ''} variant={location.state?.message ? 'success' : 'info'} />
        <FormStatus variant={formError?.variant}>
          {formError && (
            <>
              {formError.title && <strong className="d-block mb-1">{formError.title}</strong>}
              {formError.message}
              {formError.locked && (
                <span className="d-block mt-2">
                  You can also{' '}
                  <Link to="/forgot-password" className="alert-link">
                    reset your password
                  </Link>
                  .
                </span>
              )}
            </>
          )}
        </FormStatus>

        <TextField
          id="login-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          className="mb-2"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="text-end mb-4">
          <Link to="/forgot-password" className="link-brand" style={{ fontSize: 14 }}>
            Forgot password?
          </Link>
        </div>

        <SubmitButton pending={isSubmitting} pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </Form>
    </AuthLayout>
  );
}
