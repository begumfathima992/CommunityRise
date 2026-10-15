import { Alert } from 'react-bootstrap';

/**
 * Form-level message in a persistent live region, so screen readers
 * announce errors and confirmations as they appear.
 */
export default function FormStatus({ message, variant = 'danger', children, className = 'mb-4' }) {
  const urgent = variant === 'danger' || variant === 'warning';
  return (
    <div aria-live={urgent ? 'assertive' : 'polite'} aria-atomic="true">
      {(message || children) && (
        <Alert variant={variant} className={className} role={urgent ? 'alert' : 'status'}>
          {message}
          {children}
        </Alert>
      )}
    </div>
  );
}
