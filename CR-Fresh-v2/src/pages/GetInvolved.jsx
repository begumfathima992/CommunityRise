import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RevealBox from '../components/RevealBox';
import { useDonationModal } from '../context/DonationModalContext';
import { IMAGES } from '../images';

const PATHWAYS = [
  { title: 'Volunteer', body: 'A single afternoon a month, or a regular weekly commitment — directly support our programmes on the ground alongside our team.' },
  { title: 'Donate', body: 'Every contribution, large or small, makes a measurable and traceable difference to a family in genuine need.' },
  { title: 'Partner', body: "Align your organisation's CSR goals with a trusted, community-rooted charity led by hands-on founders who understand Newham intimately." },
  { title: 'Fundraise', body: "A sponsored event, a workplace collection, or a personal challenge — we'll support you every step of the way." },
];

const TIERS = [
  { amount: 20, impact: 'Provides emergency food support to a struggling family this very week.' },
  { amount: 50, impact: 'Funds a full advice session helping someone secure housing support they are legally entitled to but might otherwise never access.' },
  { amount: 100, impact: 'Sponsors a place on our youth mentorship programme for a full month, changing the trajectory of a young person\'s life.' },
];

export default function GetInvolved() {
  const { openModal } = useDonationModal();

  return (
    <>
      <section className="page-hero bg-pale-brand">
        <Container>
          <RevealBox>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <p className="section-eyebrow">Get Involved</p>
                <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 42px)', marginTop: 10 }}>
                  There are many ways to become part of the Community Rise family.
                </h1>
                <p style={{ fontSize: 16.5, color: 'var(--muted)', marginTop: 16 }}>
                  Whether you volunteer an hour, donate a pound, or simply share our story with a
                  friend, you become part of a movement that is transforming lives across our
                  community, one family at a time.
                </p>
              </Col>
              <Col lg={6}>
                <div className="hero-image-wrap">
                  <img src={IMAGES.doorstepDelivery} alt="Volunteers delivering groceries to an elderly resident" style={{ width: '100%', height: 320, objectFit: 'cover' }} />
                </div>
              </Col>
            </Row>
          </RevealBox>
        </Container>
      </section>

      {/* PATHWAYS */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="g-4">
            {PATHWAYS.map((p) => (
              <Col md={6} lg={3} key={p.title}>
                <RevealBox style={{ height: '100%' }}>
                  <Card className="card-soft h-100 p-3 text-center">
                    <Card.Body>
                      <Card.Title style={{ fontSize: 19 }}>{p.title}</Card.Title>
                      <Card.Text style={{ color: 'var(--muted)', fontSize: 14 }}>{p.body}</Card.Text>
                    </Card.Body>
                  </Card>
                </RevealBox>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* DONATION TIERS */}
      <section className="py-5" style={{ background: 'var(--sky-deep)' }}>
        <Container>
          <RevealBox className="text-center mb-5">
            <p className="section-eyebrow" style={{ color: 'var(--navajo)' }}>Donate</p>
            <h2 style={{ color: 'var(--white)', fontSize: 30, marginTop: 10 }}>
              A gift of any size moves us closer to a Newham where everyone can rise.
            </h2>
          </RevealBox>
          <Row className="g-4 justify-content-center">
            {TIERS.map((t, i) => (
              <Col md={4} key={t.amount}>
                <RevealBox style={{ height: '100%' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '32px 26px',
                    height: '100%', display: 'flex', flexDirection: 'column',
                  }}>
                    <p style={{ fontSize: 34, fontWeight: 800, color: 'var(--navajo)', fontFamily: 'var(--font-heading)' }}>
                      &pound;{t.amount}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.78)', flexGrow: 1 }}>{t.impact}</p>
                    <Button className="btn-navajo mt-3" onClick={() => openModal(i)}>
                      Give &pound;{t.amount}
                    </Button>
                  </div>
                </RevealBox>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* IMPACT COLLAGE */}
      <section className="py-5 bg-white">
        <Container>
          <RevealBox className="text-center mb-4">
            <p className="section-eyebrow">Small Act, Big Impact</p>
            <h2 style={{ fontSize: 26, marginTop: 10 }}>Every act of kindness counts.</h2>
          </RevealBox>
          <RevealBox className="text-center">
            <img
              src={IMAGES.impactCollage}
              alt="Collage celebrating giving, volunteering, and community kindness"
              style={{ width: '100%', maxWidth: 900, borderRadius: 14 }}
            />
          </RevealBox>
        </Container>
      </section>

      {/* PARTNER CTA */}
      <section className="py-5 bg-pale-brand">
        <Container className="text-center">
          <RevealBox style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ fontSize: 26 }}>Looking for a cause to support as a business?</h2>
            <p style={{ color: 'var(--muted)', marginTop: 12 }}>
              We welcome partnerships with local businesses, schools, faith groups, and other
              charities who share our commitment to lifting up the Newham community.
            </p>
            <Button as={Link} to="/contact" className="btn-sky mt-2">
              Get in Touch
            </Button>
          </RevealBox>
        </Container>
      </section>
    </>
  );
}
