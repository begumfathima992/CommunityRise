import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import * as authApi from '../../api/auth';
import { applyServerFieldErrors, getErrorMessage } from '../../api/errors';
import AuthLayout from '../../components/auth/AuthLayout';
import FormStatus from '../../components/auth/FormStatus';
import SubmitButton from '../../components/auth/SubmitButton';
import TextField from '../../components/auth/TextField';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { emailOnlySchema } from '../../validation/authSchemas';

// Shown whether or not an account exists, so the page never reveals
// which email addresses are registered.
const CONFIRMATION =
  'If an account exists for that email address, we have sent a link to reset your password. The link expires in 1 hour.';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(emailOnlySchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = useSubmitLock(async ({ email }) => {
    setFormError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (error) {
      applyServerFieldErrors(error, setError, ['email']);
      setFormError(
        getErrorMessage(error, {
          429: 'You have requested several password resets recently. Please wait an hour and try again.',
        }),
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Account help"
      title="Forgot your password?"
      intro={sent ? undefined : "Enter the email address you signed up with and we'll send you a link to choose a new password."}
      footer={
        <Link to="/login" className="link-brand">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <>
          <FormStatus variant="success" message={CONFIRMATION} />
          <p style={{ fontSize: 14.5, color: 'var(--muted)' }}>
            Can't find it? Check your spam or junk folder, or try again in a few minutes.
          </p>
          <Button type="button" className="btn-outline-sky w-100" onClick={() => setSent(false)}>
            Send another link
          </Button>
        </>
      ) : (
        <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Request a password reset link">
          <FormStatus message={formError} />
          <TextField
            id="forgot-email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            className="mb-4"
            error={errors.email?.message}
            {...register('email')}
          />
          <SubmitButton pending={isSubmitting} pendingLabel="Sending link…">
            Send reset link
          </SubmitButton>
        </Form>
      )}
    </AuthLayout>
  );
}
