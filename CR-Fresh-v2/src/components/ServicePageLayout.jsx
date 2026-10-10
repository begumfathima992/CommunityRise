import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RevealBox from '../components/RevealBox';
import { useDonationModal } from '../context/DonationModalContext';

export default function ServicePageLayout({ eyebrow, title, intro, image, imageAlt, points, closingNote }) {
  const { openModal } = useDonationModal();

  return (
    <>
      <section className="page-hero bg-pale-brand">
        <Container>
          <RevealBox>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <p className="section-eyebrow">{eyebrow}</p>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginTop: 10 }}>{title}</h1>
                <p style={{ fontSize: 16.5, color: 'var(--muted)', marginTop: 16 }}>{intro}</p>
                <Button className="btn-navajo mt-2" onClick={() => openModal(1)}>
                  Support This Programme
                </Button>
              </Col>
              <Col lg={6}>
                <div className="hero-image-wrap">
                  <img src={image} alt={imageAlt} style={{ width: '100%', height: 320, objectFit: 'cover' }} />
                </div>
              </Col>
            </Row>
          </RevealBox>
        </Container>
      </section>

      <section className="py-5 bg-white">
        <Container>
          <Row className="g-4">
            {points.map((p) => (
              <Col md={6} key={p.title}>
                <RevealBox style={{ height: '100%' }}>
                  <div className="card-soft h-100 p-4">
                    <h3 style={{ fontSize: 19 }}>{p.title}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 8 }}>{p.body}</p>
                  </div>
                </RevealBox>
              </Col>
            ))}
          </Row>

          {closingNote && (
            <RevealBox className="mt-5" style={{ maxWidth: 760 }}>
              <p style={{ fontSize: 16.5, fontStyle: 'italic', color: 'var(--muted)' }}>{closingNote}</p>
            </RevealBox>
          )}

          <RevealBox className="mt-5">
            <Link to="/get-involved" style={{ fontWeight: 700, color: 'var(--sky-deep)' }}>
              &larr; See all the ways to get involved
            </Link>
          </RevealBox>
        </Container>
      </section>
    </>
  );
}
