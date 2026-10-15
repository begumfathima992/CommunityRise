import { useEffect, useState } from 'react';
import { Accordion, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { applyServerFieldErrors, getErrorMessage } from '../api/errors';
import { submitApplication } from '../api/tutorApplications';
import FormStatus from '../components/auth/FormStatus';
import SubmitButton from '../components/auth/SubmitButton';
import TextField from '../components/auth/TextField';
import RevealBox from '../components/RevealBox';
import { useAuth } from '../context/AuthContext';
import {
  AVAILABILITY,
  BENEFITS,
  DBS_STATUS,
  DELIVERY,
  LEARNER_GROUPS,
  SAFEGUARDING,
  STEPS,
  SUBJECT_GROUPS,
  TUTOR_FAQS,
} from '../data/tutoring';
import { useSubmitLock } from '../hooks/useSubmitLock';
import { IMAGES } from '../images';
import { tutorApplicationSchema } from '../validation/tutorSchemas';

const FIELDS = [
  'full_name',
  'email',
  'phone',
  'subjects',
  'learner_groups',
  'availability',
  'delivery',
  'experience',
  'dbs_status',
  'agree_to_checks',
  'consent',
];

export default function VolunteerTutor() {
  return (
    <>
      {/* HERO */}
      <section className="page-hero bg-pale-brand">
        <Container>
          <RevealBox>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <p className="section-eyebrow">Get Involved</p>
                <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 42px)', marginTop: 10 }}>Volunteer as a tutor</h1>
                <p style={{ fontSize: 16.5, color: 'var(--muted)', marginTop: 16 }}>
                  Share your knowledge for an hour a week. Help children with their schoolwork, or help women, young
                  people and adults in Newham build the digital skills they need for work and everyday life. Our
                  courses are led by an experienced instructor and IT engineer, and our learners take part free of
                  charge.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                  <Button as="a" href="#apply" className="btn-navajo">
                    Apply to tutor
                  </Button>
                  <Button as="a" href="#how-it-works" className="btn-outline-sky">
                    How it works
                  </Button>
                </div>
              </Col>
              <Col lg={6}>
                <div className="hero-image-wrap">
                  <img
                    src={IMAGES.youthTutoring}
                    alt="A smiling volunteer helping a young girl with her schoolwork in a classroom"
                    style={{ width: '100%', height: 340, objectFit: 'cover', objectPosition: '75% 70%' }}
                  />
                </div>
              </Col>
            </Row>
          </RevealBox>
        </Container>
      </section>

      {/* WHAT YOU COULD TEACH */}
      <section className="py-5 bg-white">
        <Container>
          <h2 style={{ fontSize: 28 }} className="mb-4">
            What you could teach
          </h2>
          <Row className="g-4">
            {SUBJECT_GROUPS.map((group) => (
              <Col md={6} key={group.id}>
                <Card className="card-soft auth-card h-100">
                  <Card.Body className="p-4">
                    <Card.Title as="h3" style={{ fontSize: 21 }}>
                      {group.title}
                    </Card.Title>
                    <Card.Text style={{ color: 'var(--muted)' }}>{group.body}</Card.Text>
                    <ul className="workshop-list mb-0">
                      {group.subjects.map((subject) => (
                        <li key={subject.value}>{subject.label}</li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-5 bg-pale-brand">
        <Container>
          <h2 style={{ fontSize: 28 }} className="mb-4">
            What you get
          </h2>
          <Row className="g-4">
            {BENEFITS.map((benefit) => (
              <Col sm={6} lg={3} key={benefit.title}>
                <div className="card-soft auth-card p-4 h-100">
                  <h3 style={{ fontSize: 18 }}>{benefit.title}</h3>
                  <p className="mb-0" style={{ color: 'var(--muted)', fontSize: 14.5 }}>
                    {benefit.body}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-5 bg-white anchor-target">
        <Container>
          <Row className="g-5">
            <Col lg={7}>
              <h2 style={{ fontSize: 28 }} className="mb-4">
                How it works
              </h2>
              <ol className="steps-list">
                {STEPS.map((step) => (
                  <li key={step.title}>
                    <h3 style={{ fontSize: 18 }}>{step.title}</h3>
                    <p className="mb-0" style={{ color: 'var(--muted)', fontSize: 15 }}>
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>
            </Col>
            <Col lg={5}>
              <div className="card-soft auth-card p-4" style={{ borderLeft: '4px solid var(--sky-deep)' }}>
                <h2 style={{ fontSize: 21 }}>Keeping learners safe</h2>
                <ul className="workshop-list mb-0">
                  {SAFEGUARDING.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply" className="py-5 bg-pale-brand anchor-target">
        <Container>
          <Row className="justify-content-center">
            <Col lg={9} xl={8}>
              <h2 style={{ fontSize: 28 }}>Apply to volunteer as a tutor</h2>
              <p style={{ color: 'var(--muted)' }}>
                No account needed. We'll email you a confirmation and be in touch to arrange a chat.
              </p>
              <div className="card-soft auth-card p-4 p-md-5 mt-3">
                <TutorApplicationForm />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQS */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="justify-content-center">
            <Col lg={9} xl={8}>
              <h2 style={{ fontSize: 28 }} className="mb-4">
                Questions about tutoring
              </h2>
              <Accordion className="faq-accordion">
                {TUTOR_FAQS.map((faq, index) => (
                  <Accordion.Item eventKey={String(index)} key={faq.q}>
                    <Accordion.Header as="h3">{faq.q}</Accordion.Header>
                    <Accordion.Body style={{ color: 'var(--muted)' }}>{faq.a}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
              <p className="mt-4" style={{ color: 'var(--muted)' }}>
                Something else? <Link to="/contact" className="link-brand">Get in touch</Link>.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

function ChoiceGroup({ name, legend, hint, options, type = 'checkbox', register, error, columns = 1 }) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  return (
    <fieldset
      className="mb-4"
      aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined}
    >
      <legend className="form-label-brand mb-1" style={{ fontSize: 13.5 }}>
        {legend}
      </legend>
      {hint && (
        <Form.Text id={hintId} className="d-block mb-2">
          {hint}
        </Form.Text>
      )}
      <div className={columns > 1 ? 'choice-columns' : undefined}>
        {options.map((option) => (
          <Form.Check
            key={option.value}
            type={type}
            id={`${name}-${option.value}`}
            label={option.label}
            value={option.value}
            isInvalid={Boolean(error)}
            {...register(name)}
          />
        ))}
      </div>
      {error && (
        <div id={errorId} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </fieldset>
  );
}

function TutorApplicationForm() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState('');
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tutorApplicationSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      subjects: [],
      learner_groups: [],
      availability: [],
      delivery: null,
      experience: '',
      dbs_status: null,
      agree_to_checks: false,
      consent: false,
      website: '',
    },
  });

  // Save logged-in users some typing.
  useEffect(() => {
    if (!user) return;
    if (!getValues('full_name')) setValue('full_name', user.full_name);
    if (!getValues('email')) setValue('email', user.email);
  }, [user, getValues, setValue]);

  const onSubmit = useSubmitLock(async (values) => {
    setFormError('');
    try {
      const res = await submitApplication(values);
      setSubmitted(res.message);
    } catch (error) {
      applyServerFieldErrors(error, setError, FIELDS);
      setFormError(
        getErrorMessage(error, {
          409: 'We already have an application from this email address and will be in touch soon.',
          429: 'Too many applications from your connection. Please try again later.',
        }),
      );
    }
  });

  if (submitted) {
    return (
      <div>
        <FormStatus variant="success" message={submitted} />
        <p style={{ color: 'var(--muted)' }}>
          While you wait, take a look at our{' '}
          <Link to="/get-involved/teaching-resources" className="link-brand">
            teaching resources
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Volunteer tutor application">
      <FormStatus message={formError} />

      <Row className="g-0 gx-md-3">
        <Col md={6}>
          <TextField
            id="tutor-full-name"
            label="Full name"
            autoComplete="name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
        </Col>
        <Col md={6}>
          <TextField
            id="tutor-phone"
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            hint="So we can call you to arrange a chat."
            error={errors.phone?.message}
            {...register('phone')}
          />
        </Col>
      </Row>
      <TextField
        id="tutor-email"
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

      <fieldset className="mb-2">
        <legend className="form-label-brand mb-1" style={{ fontSize: 13.5 }}>
          What could you teach?
        </legend>
        <Form.Text className="d-block mb-2">Choose all that apply.</Form.Text>
        <Row>
          {SUBJECT_GROUPS.map((group) => (
            <Col md={6} key={group.id}>
              <p className="mb-1 mt-2" style={{ fontWeight: 600, fontSize: 14 }}>
                {group.title}
              </p>
              {group.subjects.map((subject) => (
                <Form.Check
                  key={subject.value}
                  type="checkbox"
                  id={`subjects-${subject.value}`}
                  label={subject.label}
                  value={subject.value}
                  isInvalid={Boolean(errors.subjects)}
                  aria-describedby={errors.subjects ? 'subjects-error' : undefined}
                  {...register('subjects')}
                />
              ))}
            </Col>
          ))}
        </Row>
        {errors.subjects && (
          <div id="subjects-error" className="invalid-feedback d-block">
            {errors.subjects.message ?? errors.subjects[0]?.message}
          </div>
        )}
      </fieldset>
      <div className="mb-4" />

      <ChoiceGroup
        name="learner_groups"
        legend="Who would you like to teach?"
        hint="Choose all that apply."
        options={LEARNER_GROUPS}
        register={register}
        error={errors.learner_groups?.message}
        columns={2}
      />
      <ChoiceGroup
        name="availability"
        legend="When are you usually available?"
        hint="Choose all that apply."
        options={AVAILABILITY}
        register={register}
        error={errors.availability?.message}
        columns={2}
      />
      <ChoiceGroup
        name="delivery"
        legend="How would you like to teach?"
        type="radio"
        options={DELIVERY}
        register={register}
        error={errors.delivery?.message}
      />

      <Form.Group controlId="tutor-experience" className="mb-4">
        <Form.Label className="form-label-brand">Your experience</Form.Label>
        <Form.Text id="tutor-experience-hint" className="d-block mb-2">
          Teaching, tutoring, IT work, or anything else relevant, in a few sentences.
        </Form.Text>
        <Form.Control
          as="textarea"
          rows={5}
          maxLength={2000}
          isInvalid={Boolean(errors.experience)}
          aria-invalid={errors.experience ? 'true' : 'false'}
          aria-describedby={['tutor-experience-hint', errors.experience && 'tutor-experience-error'].filter(Boolean).join(' ')}
          {...register('experience')}
        />
        <Form.Control.Feedback type="invalid" id="tutor-experience-error">
          {errors.experience?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <ChoiceGroup
        name="dbs_status"
        legend="DBS check"
        hint="Everyone who tutors with us needs an enhanced DBS check. If you don't have one, we'll arrange it."
        type="radio"
        options={DBS_STATUS}
        register={register}
        error={errors.dbs_status?.message}
      />

      {/* Honeypot: hidden from people and assistive technology; bots fill it in. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="tutor-website">Leave this field empty</label>
        <input id="tutor-website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <Form.Group controlId="tutor-agree-checks" className="mb-3">
        <Form.Check
          type="checkbox"
          isInvalid={Boolean(errors.agree_to_checks)}
          aria-describedby={errors.agree_to_checks ? 'tutor-agree-checks-error' : undefined}
          label="I understand I will need two references, an enhanced DBS check and safeguarding training before I start tutoring."
          {...register('agree_to_checks')}
        />
        {errors.agree_to_checks && (
          <div id="tutor-agree-checks-error" className="invalid-feedback d-block">
            {errors.agree_to_checks.message}
          </div>
        )}
      </Form.Group>

      <Form.Group controlId="tutor-consent" className="mb-4">
        <Form.Check
          type="checkbox"
          isInvalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? 'tutor-consent-error' : undefined}
          label={
            <>
              I agree to Community Rise storing my application as described in the{' '}
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
          <div id="tutor-consent-error" className="invalid-feedback d-block">
            {errors.consent.message}
          </div>
        )}
      </Form.Group>

      <SubmitButton pending={isSubmitting} pendingLabel="Sending application…" className="btn-navajo">
        Send application
      </SubmitButton>
    </Form>
  );
}
