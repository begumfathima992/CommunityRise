import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as authApi from '../../api/auth';
import { applyServerFieldErrors, getErrorMessage, getStatus } from '../../api/errors';
import AuthLayout from '../../components/auth/AuthLayout';
import FormStatus from '../../components/auth/FormStatus';
import PasswordChecklist from '../../components/auth/PasswordChecklist';
import PasswordField from '../../components/auth/PasswordField';
import SubmitButton from '../../components/auth/SubmitButton';
import { useAuth } from '../../context/AuthContext';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { resetPasswordSchema } from '../../validation/authSchemas';

const INVALID_LINK = 'This password reset link is invalid or has expired.';

export default function ResetPassword() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Keep the token in memory and remove it from the address bar.
  const [token] = useState(() => searchParams.get('token') || '');
  const [linkInvalid, setLinkInvalid] = useState(!token);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (token) navigate('/reset-password', { replace: true });
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirm_password: '' },
  });

  const onSubmit = useSubmitLock(async (values) => {
    setFormError('');
    try {
      await authApi.resetPassword({ token, ...values });
      // The reset signs out every session, including this browser's.
      if (user) await logout().catch(() => {});
      navigate('/login', {
        replace: true,
        state: { message: 'Your password has been reset. Please log in with your new password.' },
      });
    } catch (error) {
      if (getStatus(error) === 400) {
        setLinkInvalid(true);
        return;
      }
      const mapped = applyServerFieldErrors(error, setError, ['password', 'confirm_password']);
      if (!mapped && error.response?.data?.errors?.token) {
        setLinkInvalid(true);
        return;
      }
      setFormError(getErrorMessage(error));
    }
  });

  if (linkInvalid) {
    return (
      <AuthLayout eyebrow="Account help" title="Link not valid">
        <FormStatus variant="warning" message={`${INVALID_LINK} Reset links can only be used once and expire after 1 hour.`} />
        <Button as={Link} to="/forgot-password" className="btn-navajo w-100">
          Request a new link
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout eyebrow="Account help" title="Choose a new password">
      <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Choose a new password">
        <FormStatus message={formError} />
        <PasswordField
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          describedBy="reset-password-rules"
          className="mb-2"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordChecklist id="reset-password-rules" password={watch('password')} checkEmail={false} />
        <PasswordField
          id="reset-confirm-password"
          label="Confirm new password"
          autoComplete="new-password"
          className="mb-4"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />
        <SubmitButton pending={isSubmitting} pendingLabel="Saving…">
          Reset password
        </SubmitButton>
      </Form>
    </AuthLayout>
  );
}
