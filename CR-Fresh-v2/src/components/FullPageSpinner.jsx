import { Spinner } from 'react-bootstrap';

export default function FullPageSpinner({ label = 'Loading…' }) {
  return (
    <div
      className="d-flex justify-content-center align-items-center bg-pale-brand"
      style={{ minHeight: '60vh' }}
      role="status"
      aria-live="polite"
    >
      <Spinner animation="border" style={{ color: 'var(--sky-deep)' }} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
