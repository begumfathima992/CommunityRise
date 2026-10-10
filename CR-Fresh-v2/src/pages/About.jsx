import { Container, Row, Col, Card } from 'react-bootstrap';
import RevealBox from '../components/RevealBox';
import { IMAGES } from '../images';

const FOUNDERS = [
  {
    name: 'Danyal Aziz',
    role: 'Director & Company Secretary',
    bio: 'Danyal founded Community Rise because he witnessed, firsthand, the widening gap between what families in Newham genuinely need and what statutory services are able to provide — and chose to build an organisation that closes that gap rather than simply talk about it.',
  },
  {
    name: 'Afan Hussain',
    role: 'Founding Member & Guarantor',
    bio: 'Afan stands alongside Danyal as a founding member and guarantor of the company, bringing dedication and a shared belief in the mission of lifting up the local community.',
  },
  {
    name: 'Tooba Qasim',
    role: 'Founding Member & Guarantor',
    bio: 'Tooba co-founded the organisation as a guarantor member, contributing to the vision and values that continue to guide Community Rise today.',
  },
];

export default function About() {
  return (
    <>
      <section className="page-hero bg-pale-brand">
        <Container>
          <RevealBox>
            <p className="section-eyebrow">About Community Rise</p>
            <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', marginTop: 10, maxWidth: 760 }}>
              A community that supports its own.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--muted)', marginTop: 16, maxWidth: 700 }}>
              Community Rise exists to lift people up. We believe, without reservation, that
              every person in Newham and across London deserves a genuine chance to thrive,
              whatever their background, income, or the circumstances they were born into.
            </p>
          </RevealBox>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <RevealBox>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <div className="hero-image-wrap">
                  <img src={IMAGES.foodbankHandoff} alt="Volunteers handing a food donation box to a family" style={{ width: '100%', height: 360, objectFit: 'cover' }} />
                </div>
              </Col>
              <Col lg={6}>
                <p className="section-eyebrow">Our Story</p>
                <h2 style={{ fontSize: 28, marginTop: 10 }}>Formally incorporated, deliberately structured.</h2>
                <p style={{ color: 'var(--muted)', marginTop: 14 }}>
                  Community Rise was formally incorporated as a private company limited by
                  guarantee — a structure chosen deliberately because it ensures every pound
                  raised is reinvested into our charitable mission rather than distributed as
                  profit to any individual.
                </p>
                <p style={{ color: 'var(--muted)' }}>
                  As our charity grows, we are committed to registering with the Charity
                  Commission for England and Wales and to meeting every obligation that regulator
                  places upon us, including preparing annual accounts, publishing a trustees'
                  annual report, and maintaining full transparency with the public we serve.
                </p>
              </Col>
            </Row>
          </RevealBox>
        </Container>
      </section>

      <section className="py-5 bg-white">
        <Container>
          <RevealBox className="mb-5">
            <p className="section-eyebrow">Our Founding Team</p>
            <h2 style={{ fontSize: 30, marginTop: 10 }}>Three names, personally staked on this community.</h2>
            <p style={{ color: 'var(--muted)', maxWidth: 700, marginTop: 12 }}>
              Community Rise was brought into being by three committed individuals whose names
              appear on our official incorporation documents, and who each personally guaranteed
              the company at its founding.
            </p>
          </RevealBox>
          <Row className="g-4">
            {FOUNDERS.map((f) => (
              <Col md={4} key={f.name}>
                <RevealBox style={{ height: '100%' }}>
                  <Card className="card-soft h-100" style={{ borderTop: '4px solid var(--sky)' }}>
                    <Card.Body className="p-4">
                      <Card.Title style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>{f.name}</Card.Title>
                      <p style={{ fontSize: 11.5, letterSpacing: '0.05em', color: 'var(--sky-deep)', fontWeight: 700 }}>
                        {f.role.toUpperCase()}
                      </p>
                      <Card.Text style={{ color: 'var(--muted)', fontSize: 14.5 }}>{f.bio}</Card.Text>
                    </Card.Body>
                  </Card>
                </RevealBox>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-ink-brand">
        <Container className="text-center">
          <RevealBox style={{ maxWidth: 760, margin: '0 auto' }}>
            <p className="section-eyebrow" style={{ color: 'var(--navajo)' }}>A Message From Our Founder</p>
            <p style={{
              fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 500,
              fontSize: 'clamp(20px, 2.6vw, 27px)', color: 'var(--white)', marginTop: 16,
            }}>
              &ldquo;Leadership in the charitable sector is not about visibility. It is about
              consistency, integrity, and showing up for people when it matters most.&rdquo;
            </p>
            <p style={{ fontWeight: 700, color: 'var(--white)', marginTop: 18 }}>Danyal Aziz</p>
            <p style={{ fontSize: 12, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.6)' }}>
              DIRECTOR &amp; COMPANY SECRETARY
            </p>
          </RevealBox>
        </Container>
      </section>
    </>
  );
}
