import { Col, Container, Row } from 'react-bootstrap';

/** Shared page shell for the auth and account pages, matching the site's page-hero style. */
export default function AuthLayout({ eyebrow, title, intro, children, footer, wide = false }) {
  return (
    <section className="page-hero bg-pale-brand" style={{ paddingBottom: 80 }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={wide ? 10 : 8} lg={wide ? 8 : 6} xl={wide ? 7 : 5}>
            {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)' }}>{title}</h1>
            {intro && <p style={{ fontSize: 15.5, color: 'var(--muted)', marginTop: 8 }}>{intro}</p>}
            <div className="card-soft auth-card p-4 p-md-5 mt-4">{children}</div>
            {footer && (
              <div className="text-center mt-4" style={{ fontSize: 15, color: 'var(--muted)' }}>
                {footer}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
}
