import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import RevealBox from '../components/RevealBox';
import { CONTACT_API_URL, CONTACT_EMAIL } from '../emailConfig';

const REASONS = ['Volunteer', 'Donate', 'Refer someone for support', 'Partner with us', 'Something else'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', reason: REASONS[0], message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong sending your message.');
      }

      setStatus('sent');
    } catch (err) {
      console.error('Contact form submission failed:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <section className="page-hero bg-pale-brand" style={{ paddingBottom: 80 }}>
      <Container>
        <RevealBox>
          <Row className="g-5">
            <Col lg={5}>
              <p className="section-eyebrow">Contact Us</p>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', marginTop: 10 }}>
                Let's talk about how we can help, together.
              </h1>
              <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: 16 }}>
                Whether you want to volunteer, donate, refer someone for support, or simply learn
                more about our work, our team is ready to welcome you and answer your questions
                honestly.
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 26 }}>Registered office</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                393a Green Street, Newham, London, E13 9AU
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 18 }}>Email us directly</p>
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ fontSize: 16, fontWeight: 700, color: 'var(--sky-deep)' }}>
                {CONTACT_EMAIL}
              </a>
            </Col>
            <Col lg={7}>
              {status === 'sent' ? (
                <div className="card-soft p-4" style={{ background: 'var(--sky-deep)', color: 'var(--white)' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 22 }}>
                    Thank you — your message has been sent.
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Someone from Community Rise will be in touch shortly.
                  </p>
                </div>
              ) : (
                <Form onSubmit={handleSubmit} className="card-soft p-4">
                  {status === 'error' && (
                    <Alert variant="warning" className="mb-3">
                      {errorMsg} In the meantime, please email us directly at{' '}
                      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                    </Alert>
                  )}
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontWeight: 600, fontSize: 13.5 }}>Your name</Form.Label>
                        <Form.Control required value={form.name} onChange={update('name')} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontWeight: 600, fontSize: 13.5 }}>Email</Form.Label>
                        <Form.Control required type="email" value={form.email} onChange={update('email')} />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label style={{ fontWeight: 600, fontSize: 13.5 }}>I'm getting in touch to</Form.Label>
                        <Form.Select value={form.reason} onChange={update('reason')}>
                          {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label style={{ fontWeight: 600, fontSize: 13.5 }}>Message</Form.Label>
                        <Form.Control required as="textarea" rows={5} value={form.message} onChange={update('message')} />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Button type="submit" className="btn-navajo" disabled={status === 'sending'}>
                        {status === 'sending' ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Col>
          </Row>
        </RevealBox>
      </Container>
    </section>
  );
}
