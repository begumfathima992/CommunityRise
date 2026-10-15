import { Button, Spinner } from 'react-bootstrap';

/** Brand submit button that disables itself and shows a spinner while pending. */
export default function SubmitButton({ pending, pendingLabel, children, className = 'btn-navajo w-100', ...props }) {
  return (
    <Button type="submit" className={className} disabled={pending} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
