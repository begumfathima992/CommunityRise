import { forwardRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

/** Password input with a show/hide toggle and accessible inline error. */
const PasswordField = forwardRef(function PasswordField(
  { id, label, error, describedBy, className = 'mb-3', ...inputProps },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  const ariaDescribedBy = [describedBy, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <Form.Group controlId={id} className={className}>
      <Form.Label className="form-label-brand">{label}</Form.Label>
      <InputGroup hasValidation>
        <Form.Control
          ref={ref}
          type={visible ? 'text' : 'password'}
          isInvalid={Boolean(error)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={ariaDescribedBy}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...inputProps}
        />
        <Button
          type="button"
          variant="outline-secondary"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
        >
          {visible ? 'Hide' : 'Show'}
        </Button>
        <Form.Control.Feedback type="invalid" id={errorId}>
          {error}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  );
});

export default PasswordField;
