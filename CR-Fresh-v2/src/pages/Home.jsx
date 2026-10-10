import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RevealBox from '../components/RevealBox';
import { useDonationModal } from '../context/DonationModalContext';
import { IMAGES } from '../images';

const SERVICES_PREVIEW = [
  { to: '/services/community-support', title: 'Community Support', body: 'Food, essentials, and guidance through crisis — without delay.' },
  { to: '/services/advice-signposting', title: 'Advice & Signposting', body: 'Help navigating housing, benefits, and local authority processes.' },
  { to: '/services/youth-engagement', title: 'Youth Engagement', body: 'Safe spaces, real mentorship, and a path to real opportunity.' },
  { to: '/services/wellbeing-inclusion', title: 'Wellbeing & Inclusion', body: 'Combating isolation among elderly and vulnerable residents.' },
];

const TIERS = [
  { amount: 20, impact: 'Provides emergency food support to a struggling family this very week.' },
  { amount: 50, impact: 'Funds a full advice session helping someone secure housing support.' },
  { amount: 100, impact: 'Sponsors a place on our youth mentorship programme for a month.' },
];

const HERO_SLIDES = [
  { image: IMAGES.foodbankHall, alt: 'Volunteers at a community food bank helping local residents', caption: 'Together, we rise.' },
  { image: IMAGES.doorstepDelivery, alt: 'Volunteers delivering groceries to an elderly resident', caption: 'No one should face hardship alone.' },
];

export default function Home() {
  const { openModal } = useDonationModal();

  return (
    <>
      {/* HERO CAROUSEL */}
      <section className="bg-pale-brand">
        <Carousel fade indicators={true} controls={true} interval={4500}>
          {HERO_SLIDES.map((slide) => (
            <Carousel.Item key={slide.caption}>
              <div style={{ position: 'relative', height: 520 }}>
                <img
                  src={slide.image}
                  alt={slide.alt}
                  style={{ width: '100%', height: 520, objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(0deg, rgba(27,42,65,0.55) 0%, rgba(27,42,65,0.05) 55%)',
                }} />
                <Carousel.Caption style={{ textAlign: 'left', left: '5%', right: '5%', bottom: 60 }}>
                  <h2 style={{ color: 'var(--white)', fontSize: 'clamp(26px, 4vw, 40px)', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
                    {slide.caption}
                  </h2>
                </Carousel.Caption>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>

        <Container className="text-center" style={{ paddingTop: 44, paddingBottom: 56 }}>
          <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 640, margin: '0 auto' }}>
            Community Rise walks alongside families and individuals across Newham as they rise
            above hardship — through practical support, honest advice, and programmes built by
            and for our own community.
          </p>
          <div className="d-flex gap-3 flex-wrap justify-content-center mt-4">
            <Button className="btn-navajo" size="lg" onClick={() => openModal(0)}>
              Donate Today
            </Button>
            <Button as={Link} to="/get-involved" className="btn-outline-sky" size="lg">
              Get Involved
            </Button>
          </div>
        </Container>
      </section>

      {/* FOUNDER SIGNATURE STRIP */}
      <section className="bg-ink-brand py-4">
        <Container>
          <Row className="g-4 align-items-center">
            {[
              ['Danyal Aziz', 'Director & Company Secretary'],
              ['Afan Hussain', 'Founding Member & Guarantor'],
              ['Tooba Qasim', 'Founding Member & Guarantor'],
            ].map(([name, role]) => (
              <Col md={4} key={name}>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--white)', margin: 0 }}>{name}</p>
                <p style={{ fontSize: 12.5, letterSpacing: '0.04em', color: 'var(--navajo)', margin: 0 }}>{role.toUpperCase()}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* MISSION */}
      <section className="py-5 my-4">
        <Container>
          <RevealBox>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <p className="section-eyebrow">Our Mission</p>
                <h2 style={{ fontSize: 32, marginTop: 10 }}>
                  When a community supports its own, everyone rises together.
                </h2>
                <p style={{ color: 'var(--muted)', marginTop: 16, fontSize: 16.5 }}>
                  We are a Newham-based charitable company working at the heart of one of
                  London's most vibrant and diverse boroughs, where genuine hardship often hides
                  quietly behind closed doors and unspoken struggle.
                </p>
                <Button as={Link} to="/about" className="btn-outline-sky mt-2">
                  Read our full story &rarr;
                </Button>
              </Col>
              <Col lg={6}>
                <div className="hero-image-wrap">
                  <img src={IMAGES.foodbankHandoff} alt="Volunteers handing a food donation box to a family" style={{ width: '100%', height: 320, objectFit: 'cover' }} />
                </div>
              </Col>
            </Row>
          </RevealBox>
        </Container>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-5 bg-white">
        <Container>
          <RevealBox className="text-center mb-5">
            <p className="section-eyebrow">What We Do</p>
            <h2 style={{ fontSize: 32, marginTop: 10 }}>Real programmes, built where the need is.</h2>
          </RevealBox>
          <Row className="g-4">
            {SERVICES_PREVIEW.map((s) => (
              <Col md={6} lg={3} key={s.to}>
                <RevealBox style={{ height: '100%' }}>
                  <Card className="card-soft h-100 p-3">
                    <Card.Body>
                      <Card.Title style={{ fontSize: 18 }}>{s.title}</Card.Title>
                      <Card.Text style={{ color: 'var(--muted)', fontSize: 14.5 }}>{s.body}</Card.Text>
                      <Button as={Link} to={s.to} variant="link" className="p-0" style={{ color: 'var(--sky-deep)', fontWeight: 700 }}>
                        Learn more &rarr;
                      </Button>
                    </Card.Body>
                  </Card>
                </RevealBox>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* DONATION IMPACT PREVIEW */}
      <section className="py-5" style={{ background: 'var(--sky-deep)' }}>
        <Container>
          <RevealBox>
            <Row className="align-items-center g-5">
              <Col lg={5}>
                <p className="section-eyebrow" style={{ color: 'var(--navajo)' }}>Why Your Support Matters</p>
                <h2 style={{ color: 'var(--white)', fontSize: 30, marginTop: 10 }}>
                  Every gift is a serious responsibility, not a transaction.
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 14 }}>
                  Every day that passes without support is a day a family goes without food, a
                  child falls further behind at school, or an elderly resident sits alone with no
                  one to check on them.
                </p>
              </Col>
              <Col lg={7}>
                <Row className="g-3">
                  {TIERS.map((t, i) => (
                    <Col xs={4} key={t.amount}>
                      <button
                        onClick={() => openModal(i)}
                        style={{
                          width: '100%', padding: '20px 0', borderRadius: 12, border: 'none',
                          background: 'rgba(255,255,255,0.08)', color: 'var(--white)',
                          fontWeight: 700, fontSize: 22, cursor: 'pointer',
                        }}
                        className="donate-tile"
                      >
                        &pound;{t.amount}
                      </button>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, marginTop: 8, textAlign: 'center' }}>
                        {t.impact}
                      </p>
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-3">
                  <Button className="btn-navajo" size="lg" onClick={() => openModal(0)}>
                    Donate Now
                  </Button>
                </div>
              </Col>
            </Row>
          </RevealBox>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="py-5 bg-pale-brand">
        <Container className="text-center">
          <RevealBox>
            <h2 style={{ fontSize: 30 }}>Change starts with one gift.</h2>
            <p style={{ color: 'var(--muted)', maxWidth: 560, margin: '14px auto 26px' }}>
              Stand with Danyal, Afan, and Tooba, and help someone in Newham rise.
            </p>
            <Button className="btn-navajo" size="lg" onClick={() => openModal(0)}>
              Donate Today
            </Button>
          </RevealBox>
        </Container>
      </section>
    </>
  );
}
