import { useEffect, useState } from 'react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CHILD_AGE_GROUPS,
  HIGHLIGHTS,
  LEARNER_OPTIONS,
  MODE_OPTIONS,
  PROGRAMMES,
  courseLabel,
  labelOf,
} from '../data/freeLearning';
import { CONTACT_API_URL, CONTACT_EMAIL } from '../emailConfig';
import { useSubmitLock } from '../hooks/useSubmitLock';
import { placeRequestSchema } from '../validation/learningSchemas';
import FormStatus from './auth/FormStatus';
import SubmitButton from './auth/SubmitButton';
import TextField from './auth/TextField';

const NETWORK_ERROR = "We couldn't send your request.";

/** Builds the message sent to the team through the existing contact form endpoint. */
export function buildPlaceRequest(values) {
  const lines = [
    `Course: ${courseLabel(values.course)}`,
    `Place for: ${labelOf(LEARNER_OPTIONS, values.learner)}`,
  ];
  if (values.learner === 'child') lines.push(`Child's age group: ${labelOf(CHILD_AGE_GROUPS, values.child_age)}`);
  lines.push(
    `Online or in person: ${labelOf(MODE_OPTIONS, values.mode)}`,
    `Phone: ${values.phone}`,
    `Best times: ${values.availability || 'Not given'}`,
  );
  if (values.notes) lines.push('', 'Notes:', values.notes);

  return {
    name: values.full_name,
    email: values.email,
    reason: `Free tuition / IT course place request: ${courseLabel(values.course)}`,
    message: lines.join('\n'),
  };
}

export default function FreeLearningSection() {
  return (
    <section id="free-tuition" className="py-5 bg-pale-brand anchor-target">
      <Container>
        <p className="section-eyebrow">Learn with us</p>
        <h2 style={{ fontSize: 28, marginTop: 10 }}>Free Tuition and IT Courses</h2>
        <p style={{ color: 'var(--muted)', maxWidth: 720 }}>
          Alongside our classroom resources, Community Rise offers free academic tuition and IT courses for children,
          young people and adults in our community.
        </p>

        <ul className="highlight-list my-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <Row className="g-4">
          {PROGRAMMES.map((programme) => (
            <Col md={6} key={programme.id}>
              <Card className="card-soft auth-card h-100">
                <Card.Body className="p-4">
                  <Card.Title as="h3" style={{ fontSize: 21 }}>
                    {programme.title}
                  </Card.Title>
                  <Card.Text style={{ color: 'var(--muted)' }}>{programme.body}</Card.Text>
                  <ul className="workshop-list mb-0">
                    {programme.courses.map((course) => (
                      <li key={course.value}>{course.label}</li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="justify-content-center mt-5">
          <Col lg={9} xl={8}>
            <div className="card-soft auth-card p-4 p-md-5">
              <h3 id="request-place-heading" style={{ fontSize: 22 }}>
                Request a free place
              </h3>
              <p style={{ color: 'var(--muted)' }}>
                Tell us which course you're interested in and we'll call you to arrange a time. Parents and guardians,
                please request places for children under 18.
              </p>
              <PlaceRequestForm />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function RadioGroup({ name, legend, options, register, error }) {
  const errorId = `place-${name}-error`;
  return (
    <fieldset className="mb-3" aria-describedby={error ? errorId : undefined}>
      <legend className="form-label-brand mb-1" style={{ fontSize: 13.5 }}>
        {legend}
      </legend>
      {options.map((option) => (
        <Form.Check
          key={option.value}
          inline
          type="radio"
          id={`place-${name}-${option.value}`}
          label={option.label}
          value={option.value}
          isInvalid={Boolean(error)}
          {...register(name)}
        />
      ))}
      {error && (
        <div id={errorId} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </fieldset>
  );
}

function PlaceRequestForm() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(placeRequestSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      course: '',
      learner: null,
      child_age: '',
      mode: null,
      availability: '',
      notes: '',
      consent: false,
    },
  });
  const learner = watch('learner');

  useEffect(() => {
    if (!user) return;
    if (!getValues('full_name')) setValue('full_name', user.full_name);
    if (!getValues('email')) setValue('email', user.email);
  }, [user, getValues, setValue]);

  const onSubmit = useSubmitLock(async (values) => {
    setFormError('');
    try {
      const res = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPlaceRequest(values)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || NETWORK_ERROR);
      setSent(true);
    } catch (err) {
      setFormError(err.message && err.message !== 'Failed to fetch' ? err.message : NETWORK_ERROR);
    }
  });

  if (sent) {
    return (
      <FormStatus
        variant="success"
        message="Thank you, your request has been sent. We'll call you soon to arrange a time."
      />
    );
  }

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)} aria-labelledby="request-place-heading">
      <FormStatus message={formError}>
        {formError && (
          <>
            {' '}
            Please try again, or email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </>
        )}
      </FormStatus>

      <Form.Group controlId="place-course" className="mb-3">
        <Form.Label className="form-label-brand">Course</Form.Label>
        <Form.Select
          isInvalid={Boolean(errors.course)}
          aria-invalid={errors.course ? 'true' : 'false'}
          aria-describedby={errors.course ? 'place-course-error' : undefined}
          {...register('course')}
        >
          <option value="">Choose a course</option>
          {PROGRAMMES.map((programme) => (
            <optgroup key={programme.id} label={programme.title}>
              {programme.courses.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid" id="place-course-error">
          {errors.course?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <RadioGroup
        name="learner"
        legend="Who is the place for?"
        options={LEARNER_OPTIONS}
        register={register}
        error={errors.learner?.message}
      />

      {learner === 'child' && (
        <Form.Group controlId="place-child-age" className="mb-3">
          <Form.Label className="form-label-brand">Your child's age group</Form.Label>
          <Form.Select
            isInvalid={Boolean(errors.child_age)}
            aria-invalid={errors.child_age ? 'true' : 'false'}
            aria-describedby={errors.child_age ? 'place-child-age-error' : undefined}
            {...register('child_age')}
          >
            <option value="">Choose an age group</option>
            {CHILD_AGE_GROUPS.map((group) => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid" id="place-child-age-error">
            {errors.child_age?.message}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      <RadioGroup
        name="mode"
        legend="Online or in person?"
        options={MODE_OPTIONS}
        register={register}
        error={errors.mode?.message}
      />

      <Row className="g-0 gx-md-3">
        <Col md={6}>
          <TextField
            id="place-full-name"
            label={learner === 'child' ? 'Your name (parent or guardian)' : 'Your name'}
            autoComplete="name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
        </Col>
        <Col md={6}>
          <TextField
            id="place-phone"
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </Col>
      </Row>
      <TextField
        id="place-email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        id="place-availability"
        label="Best days and times to call or meet (optional)"
        hint="For example: weekday evenings after 6pm."
        error={errors.availability?.message}
        {...register('availability')}
      />
      <Form.Group controlId="place-notes" className="mb-3">
        <Form.Label className="form-label-brand">Anything else we should know? (optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          maxLength={1500}
          isInvalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? 'place-notes-error' : undefined}
          {...register('notes')}
        />
        <Form.Control.Feedback type="invalid" id="place-notes-error">
          {errors.notes?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="place-consent" className="mb-4">
        <Form.Check
          type="checkbox"
          isInvalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? 'place-consent-error' : undefined}
          label={
            <>
              I agree to Community Rise using these details to contact me about this request, as described in the{' '}
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
          <div id="place-consent-error" className="invalid-feedback d-block">
            {errors.consent.message}
          </div>
        )}
      </Form.Group>

      <SubmitButton pending={isSubmitting} pendingLabel="Sending request…" className="btn-navajo">
        Request a free place
      </SubmitButton>
    </Form>
  );
}
