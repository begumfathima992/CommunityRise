import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { applyServerFieldErrors, getErrorMessage } from '../../api/errors';
import AuthLayout from '../../components/auth/AuthLayout';
import FormStatus from '../../components/auth/FormStatus';
import PasswordChecklist from '../../components/auth/PasswordChecklist';
import PasswordField from '../../components/auth/PasswordField';
import SubmitButton from '../../components/auth/SubmitButton';
import TextField from '../../components/auth/TextField';
import { useAuth } from '../../context/AuthContext';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { safeRedirectPath } from '../../utils/redirect';
import { SIGNUP_REASONS, registerSchema } from '../../validation/authSchemas';

const FIELDS = ['full_name', 'email', 'signup_reason', 'password', 'confirm_password', 'consent', 'teaching_updates'];

export default function Register() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromTeachingResources = searchParams.get('interest') === 'teaching-resources';
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: '',
      email: '',
      signup_reason: '',
      password: '',
      confirm_password: '',
      consent: false,
      // Marketing opt-in must be an explicit choice, so never pre-ticked.
      teaching_updates: false,
    },
  });

  const password = watch('password');
  const email = watch('email');

  const onSubmit = useSubmitLock(async (values) => {
    setFormError('');
    try {
      await registerAccount(values);
      navigate(safeRedirectPath(location.state?.from), { replace: true });
    } catch (error) {
      applyServerFieldErrors(error, setError, FIELDS);
      setFormError(
        getErrorMessage(error, {
          409: 'An account with this email already exists. Try logging in instead.',
          429: 'Too many sign-up attempts from your connection. Please wait 15 minutes and try again.',
        }),
      );
    }
  });

  return (
    <AuthLayout
      eyebrow={fromTeachingResources ? 'Teaching resources' : 'Join Community Rise'}
      title={fromTeachingResources ? 'Sign up for teaching resource updates' : 'Create your account'}
      intro={
        fromTeachingResources
          ? 'Create your Community Rise account and tick the box below to hear about the newest teaching resources.'
          : 'Sign up to get involved, follow your activity and hear how your support is making a difference.'
      }
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="link-brand">
            Log in
          </Link>
        </>
      }
    >
      <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Create your account">
        <FormStatus message={formError} />

        <TextField
          id="register-full-name"
          label="Full name"
          autoComplete="name"
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <TextField
          id="register-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.email?.message}
          {...register('email')}
        />

        <Form.Group controlId="register-signup-reason" className="mb-3">
          <Form.Label className="form-label-brand">Why are you joining?</Form.Label>
          <Form.Select
            isInvalid={Boolean(errors.signup_reason)}
            aria-invalid={errors.signup_reason ? 'true' : 'false'}
            aria-describedby={errors.signup_reason ? 'register-signup-reason-error' : undefined}
            {...register('signup_reason')}
          >
            <option value="">Choose an option</option>
            {SIGNUP_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid" id="register-signup-reason-error">
            {errors.signup_reason?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <PasswordField
          id="register-password"
          label="Password"
          autoComplete="new-password"
          describedBy="register-password-rules"
          className="mb-2"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordChecklist id="register-password-rules" password={password} email={email} />

        <PasswordField
          id="register-confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        <Form.Group controlId="register-teaching-updates" className="mb-3">
          <Form.Check
            type="checkbox"
            label="Email me when new teaching resources are published (optional — you can change this at any time)"
            {...register('teaching_updates')}
          />
        </Form.Group>

        <Form.Group controlId="register-consent" className="mb-4">
          <Form.Check
            type="checkbox"
            isInvalid={Boolean(errors.consent)}
            aria-invalid={errors.consent ? 'true' : 'false'}
            aria-describedby={errors.consent ? 'register-consent-error' : undefined}
            label={
              <>
                I agree to Community Rise storing my details as described in the{' '}
                <Link to="/privacy" className="link-brand" target="_blank" rel="noopener">
                  privacy policy
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </Link>
                .
              </>
            }
            {...register('consent')}
          />
          {errors.consent && (
            <div id="register-consent-error" className="invalid-feedback d-block">
              {errors.consent.message}
            </div>
          )}
        </Form.Group>

        <SubmitButton pending={isSubmitting} pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </Form>
    </AuthLayout>
  );
}
