import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-hero bg-pale-brand text-center" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <Container>
        <h1 style={{ fontSize: 60 }}>404</h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', marginTop: 10 }}>
          We couldn't find that page.
        </p>
        <Button as={Link} to="/" className="btn-navajo mt-3">
          Back to Home
        </Button>
      </Container>
    </section>
  );
}
