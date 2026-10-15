import { forwardRef } from 'react';
import { Form } from 'react-bootstrap';

/** Labelled input wired for react-hook-form, with an accessible inline error. */
const TextField = forwardRef(function TextField({ id, label, error, hint, className = 'mb-3', ...inputProps }, ref) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <Form.Group controlId={id} className={className}>
      <Form.Label className="form-label-brand">{label}</Form.Label>
      <Form.Control
        ref={ref}
        isInvalid={Boolean(error)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && (
        <Form.Text id={hintId} className="d-block">
          {hint}
        </Form.Text>
      )}
      <Form.Control.Feedback type="invalid" id={errorId}>
        {error}
      </Form.Control.Feedback>
    </Form.Group>
  );
});

export default TextField;
