import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RevealBox from '../components/RevealBox';
import { EVENTS } from '../data/events';

const formatDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${iso}T00:00:00`),
  );

function upcomingEvents(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return EVENTS.filter((event) => new Date(`${event.date}T00:00:00`) >= today).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export default function Events() {
  const events = upcomingEvents();

  return (
    <>
      <section className="page-hero bg-pale-brand">
        <Container>
          <RevealBox>
            <p className="section-eyebrow">Get Involved</p>
            <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 42px)', marginTop: 10 }}>Events</h1>
            <p style={{ fontSize: 16.5, color: 'var(--muted)', marginTop: 16, maxWidth: 680 }}>
              Community days, fundraisers and workshops across Newham. Come along, bring a friend, or get in touch to
              hold an event of your own in support of Community Rise.
            </p>
          </RevealBox>
        </Container>
      </section>

      <section className="py-5 bg-white">
        <Container>
          <h2 style={{ fontSize: 28 }} className="mb-4">
            Upcoming events
          </h2>
          {events.length > 0 ? (
            <Row className="g-4">
              {events.map((event) => (
                <Col md={6} lg={4} key={event.id}>
                  <Card className="card-soft h-100">
                    <Card.Body className="d-flex flex-column p-4">
                      <p className="resource-topic mb-2">
                        <time dateTime={event.date}>{formatDate(event.date)}</time>
                        {event.time ? ` · ${event.time}` : ''}
                      </p>
                      <Card.Title as="h3" style={{ fontSize: 19 }}>
                        {event.title}
                      </Card.Title>
                      {event.location && (
                        <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{event.location}</p>
                      )}
                      <Card.Text style={{ color: 'var(--muted)', fontSize: 14.5, flexGrow: 1 }}>{event.summary}</Card.Text>
                      {event.link && (
                        <Link to={event.link} className="link-brand">
                          Find out more<span className="visually-hidden"> about {event.title}</span>
                        </Link>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="card-soft auth-card p-4 p-md-5 text-center">
              <p className="mb-2" style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 18 }}>
                No events are scheduled right now.
              </p>
              <p style={{ color: 'var(--muted)' }}>
                New dates will appear here. In the meantime, you can organise your own fundraiser or get in touch to
                hear about what's coming up.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-3">
                <Button as={Link} to="/get-involved#fundraise" className="btn-navajo">
                  Fundraise for us
                </Button>
                <Button as={Link} to="/contact" className="btn-outline-sky">
                  Get in touch
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
