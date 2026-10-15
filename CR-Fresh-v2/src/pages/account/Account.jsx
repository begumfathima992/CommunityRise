import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../../api/auth';
import { applyServerFieldErrors, getErrorMessage } from '../../api/errors';
import AuthLayout from '../../components/auth/AuthLayout';
import FormStatus from '../../components/auth/FormStatus';
import PasswordChecklist from '../../components/auth/PasswordChecklist';
import PasswordField from '../../components/auth/PasswordField';
import SubmitButton from '../../components/auth/SubmitButton';
import { useAuth } from '../../context/AuthContext';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { changePasswordSchema, signupReasonLabel } from '../../validation/authSchemas';

const memberSince = (iso) =>
  iso ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso)) : '';

export default function Account() {
  const { user } = useAuth();

  return (
    <AuthLayout eyebrow="Your account" title="Account settings" wide>
      <h2 className="h5">Your details</h2>
      <dl className="account-details mb-0">
        <dt>Name</dt>
        <dd>{user.full_name}</dd>
        <dt>Email</dt>
        <dd>
          {user.email}{' '}
          <span className={`badge ${user.is_email_verified ? 'text-bg-success' : 'text-bg-warning'}`}>
            {user.is_email_verified ? 'Verified' : 'Not verified'}
          </span>
        </dd>
        <dt>Joined as</dt>
        <dd>{signupReasonLabel(user.signup_reason)}</dd>
        {user.created_at && (
          <>
            <dt>Member since</dt>
            <dd>{memberSince(user.created_at)}</dd>
          </>
        )}
      </dl>

      <hr className="my-4" />
      <EmailPreferences optedIn={user.teaching_updates_opt_in} />

      <hr className="my-4" />
      <ChangePasswordForm email={user.email} />

      <hr className="my-4" />
      <LogoutEverywhere />
    </AuthLayout>
  );
}

function EmailPreferences({ optedIn }) {
  const { updatePreferences } = useAuth();
  // Shown immediately on toggle; reverts if saving fails.
  const [checked, setChecked] = useState(optedIn);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => setChecked(optedIn), [optedIn]);

  const toggle = async (event) => {
    if (pending) return;
    const next = event.target.checked;
    setChecked(next);
    setPending(true);
    setMessage('');
    setError('');
    try {
      const res = await updatePreferences({ teaching_updates: next });
      setMessage(res.message);
    } catch (err) {
      setChecked(!next);
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <section aria-labelledby="email-preferences-heading">
      <h2 id="email-preferences-heading" className="h5">
        Email preferences
      </h2>
      <Form.Check
        type="switch"
        role="switch"
        id="teaching-updates-switch"
        checked={checked}
        disabled={pending}
        onChange={toggle}
        label="Email me when new teaching resources are published"
      />
      <div aria-live="polite" className="mt-2">
        {message && (
          <p className="mb-0" style={{ fontSize: 14.5, color: 'var(--muted)' }}>
            {message}
          </p>
        )}
      </div>
      <div aria-live="assertive">{error && <p className="mb-0 mt-2 text-danger">{error}</p>}</div>
    </section>
  );
}

const CHANGE_FIELDS = ['current_password', 'new_password', 'confirm_password'];

function ChangePasswordForm({ email }) {
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const schema = useMemo(() => changePasswordSchema(email), [email]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  const onSubmit = useSubmitLock(async (values) => {
    setSuccess('');
    setFormError('');
    try {
      await authApi.changePassword(values);
      reset();
      setSuccess('Your password has been changed. You have been signed out on all other devices.');
    } catch (error) {
      applyServerFieldErrors(error, setError, CHANGE_FIELDS);
      setFormError(getErrorMessage(error));
    }
  });

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-labelledby="change-password-heading">
      <h2 id="change-password-heading" className="h5">
        Change password
      </h2>
      <p style={{ fontSize: 14.5, color: 'var(--muted)' }}>
        Changing your password signs you out on every other device.
      </p>
      <FormStatus message={formError} />
      <FormStatus variant="success" message={success} />

      <PasswordField
        id="current-password"
        label="Current password"
        autoComplete="current-password"
        error={errors.current_password?.message}
        {...register('current_password')}
      />
      <PasswordField
        id="new-password"
        label="New password"
        autoComplete="new-password"
        describedBy="new-password-rules"
        className="mb-2"
        error={errors.new_password?.message}
        {...register('new_password')}
      />
      <PasswordChecklist id="new-password-rules" password={watch('new_password')} email={email} />
      <PasswordField
        id="confirm-new-password"
        label="Confirm new password"
        autoComplete="new-password"
        className="mb-4"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />
      <SubmitButton pending={isSubmitting} pendingLabel="Saving…" className="btn-navajo">
        Change password
      </SubmitButton>
    </Form>
  );
}

function LogoutEverywhere() {
  const { logoutAll } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await logoutAll();
      navigate('/login', { replace: true, state: { message: 'You have been logged out of all devices.' } });
    } catch (err) {
      setError(getErrorMessage(err));
      setPending(false);
    }
  };

  return (
    <section aria-labelledby="logout-all-heading">
      <h2 id="logout-all-heading" className="h5">
        Log out of all devices
      </h2>
      <p style={{ fontSize: 14.5, color: 'var(--muted)' }}>
        If you think someone else has access to your account, sign out everywhere — including this device.
      </p>
      <FormStatus message={error} />
      {confirming ? (
        <div className="d-flex flex-column flex-sm-row gap-2" role="group" aria-label="Confirm log out of all devices">
          <Button type="button" variant="danger" onClick={handleConfirm} disabled={pending} aria-busy={pending} autoFocus>
            {pending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />
                Logging out…
              </>
            ) : (
              'Yes, log out everywhere'
            )}
          </Button>
          <Button type="button" className="btn-outline-sky" onClick={() => setConfirming(false)} disabled={pending}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button type="button" className="btn-outline-sky" onClick={() => setConfirming(true)}>
          Log out of all devices
        </Button>
      )}
    </section>
  );
}
