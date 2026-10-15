import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as authApi from '../../api/auth';
import { getErrorMessage } from '../../api/errors';
import { useAuth } from '../../context/AuthContext';
import { firstName } from '../../utils/redirect';
import { signupReasonLabel } from '../../validation/authSchemas';

const NEXT_STEPS = [
  { title: 'Get involved', body: 'Volunteer, fundraise or partner with us.', to: '/get-involved' },
  { title: 'Our services', body: 'See how we support families across Newham.', to: '/services/community-support' },
  { title: 'Get in touch', body: 'Questions? Our team is happy to help.', to: '/contact' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <section className="page-hero bg-pale-brand" style={{ paddingBottom: 80 }}>
      <Container>
        {!user.is_email_verified && <VerifyEmailBanner email={user.email} />}

        <p className="section-eyebrow mb-2">Your dashboard</p>
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 40px)' }}>Welcome, {firstName(user.full_name)}</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: 8 }}>
          You joined Community Rise as{' '}
          <strong style={{ color: 'var(--ink)' }}>{signupReasonLabel(user.signup_reason)}</strong>. Thank you for being
          part of our community.
        </p>

        <Row className="g-4 mt-2">
          {NEXT_STEPS.map((step) => (
            <Col xs={12} md={4} key={step.to}>
              <Card className="card-soft h-100 p-2">
                <Card.Body>
                  <Card.Title as="h2" style={{ fontSize: 19 }}>
                    {step.title}
                  </Card.Title>
                  <Card.Text style={{ color: 'var(--muted)', fontSize: 14.5 }}>{step.body}</Card.Text>
                  <Link to={step.to} className="link-brand stretched-link" style={{ fontWeight: 600 }}>
                    {step.title} <span aria-hidden="true">→</span>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="mt-5">
          <Button as={Link} to="/account" className="btn-outline-sky">
            Account settings
          </Button>
        </div>
      </Container>
    </section>
  );
}

function VerifyEmailBanner({ email }) {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');

  const resend = async () => {
    if (status === 'sending') return;
    setStatus('sending');
    try {
      await authApi.resendVerification(email);
      setStatus('sent');
      setMessage(`We've sent a new verification link to ${email}. It expires in 24 hours.`);
    } catch (error) {
      setStatus('error');
      setMessage(
        getErrorMessage(error, {
          429: 'You have requested several verification emails recently. Please wait an hour and try again.',
        }),
      );
    }
  };

  return (
    <Alert variant="warning" className="mb-4" role="region" aria-label="Email verification">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <strong className="d-block">Please verify your email address</strong>
          <span style={{ fontSize: 14.5 }}>
            We sent a link to <strong>{email}</strong>. Click it to confirm your address.
          </span>
        </div>
        <Button
          type="button"
          className="btn-navajo flex-shrink-0"
          onClick={resend}
          disabled={status === 'sending'}
          aria-busy={status === 'sending'}
        >
          {status === 'sending' ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />
              Sending…
            </>
          ) : (
            'Resend verification email'
          )}
        </Button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {message && (
          <p className={`mb-0 mt-2 ${status === 'error' ? 'text-danger' : ''}`} style={{ fontSize: 14.5 }}>
            {message}
          </p>
        )}
      </div>
    </Alert>
  );
}
