import { useMemo, useState } from 'react';
import { Accordion, Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FreeLearningSection from '../components/FreeLearningSection';
import RevealBox from '../components/RevealBox';
import TeachingUpdatesSignup from '../components/TeachingUpdatesSignup';
import { useDonationModal } from '../context/DonationModalContext';
import {
  AGE_GROUPS,
  FAQS,
  REQUEST_EMAIL,
  RESOURCES,
  TOPICS,
  WORKSHOPS,
  requestHref,
  topicTitle,
} from '../data/teachingResources';
import { IMAGES } from '../images';

const JUMP_LINKS = [
  { href: '#free-tuition', label: 'Free tuition and IT courses' },
  { href: '#find-resources', label: 'Find a resource' },
  { href: '#topics', label: 'Resources by topic' },
  { href: '#workshops', label: 'Workshops' },
  { href: '#sign-up', label: 'Sign up for updates' },
];

const matchesQuery = (resource, query) => {
  if (!query) return true;
  const haystack = [resource.title, resource.summary, resource.format, topicTitle(resource.topic)]
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
};

export default function TeachingResources() {
  const { openModal } = useDonationModal();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [ages, setAges] = useState('');

  const results = useMemo(
    () =>
      RESOURCES.filter(
        (resource) =>
          matchesQuery(resource, query.trim()) && (!topic || resource.topic === topic) && (!ages || resource.ages === ages),
      ),
    [query, topic, ages],
  );
  const filtersActive = Boolean(query || topic || ages);

  const showTopic = (topicId) => {
    setTopic(topicId);
    setQuery('');
    setAges('');
    document.getElementById('find-resources')?.scrollIntoView({ block: 'start' });
  };

  return (
    <>
      {/* HERO */}
      <section className="page-hero bg-pale-brand">
        <Container>
          <RevealBox>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <p className="section-eyebrow">Get Involved</p>
                <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 42px)', marginTop: 10 }}>Teaching resources</h1>
                <p style={{ fontSize: 16.5, color: 'var(--muted)', marginTop: 16 }}>
                  Lessons, assemblies and activities for teachers, youth workers and community educators, shaped by our
                  work supporting families across Newham. Explore kindness, belonging, wellbeing and how to find help,
                  with young people aged 7 to 18. We also offer free tuition and IT courses for learners of all ages.
                </p>
                <nav aria-label="On this page" className="mt-4">
                  <p className="mb-2" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>
                    Jump to
                  </p>
                  <ul className="jump-links">
                    {JUMP_LINKS.map((link) => (
                      <li key={link.href}>
                        <a href={link.href}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Col>
              <Col lg={6}>
                <div className="hero-image-wrap">
                  <img
                    src={IMAGES.youthTutoring}
                    alt="A smiling volunteer helping a young girl with her schoolwork in a classroom"
                    style={{ width: '100%', height: 340, objectFit: 'cover', objectPosition: '75% 70%' }}
                  />
                </div>
              </Col>
            </Row>
          </RevealBox>
        </Container>
      </section>

      {/* SIGN-UP (short prompt near the top, as on the full section below) */}
      <section className="py-4 bg-white">
        <Container>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <p className="mb-0" style={{ fontWeight: 600, color: 'var(--ink)' }}>
              Want to hear when new resources are published?
            </p>
            <Button as="a" href="#sign-up" className="btn-outline-sky">
              Sign-up to hear about the newest teaching resources
            </Button>
          </div>
        </Container>
      </section>

      {/* FREE TUITION AND IT COURSES */}
      <FreeLearningSection />

      {/* SEARCH + FILTERS */}
      <section id="find-resources" className="py-5 bg-white anchor-target">
        <Container>
          <h2 style={{ fontSize: 28 }}>Find a resource</h2>
          <Form
            role="search"
            aria-label="Search teaching resources"
            className="resource-filters card-soft auth-card p-3 p-md-4 mt-3"
            onSubmit={(event) => event.preventDefault()}
          >
            <Row className="g-3 align-items-end">
              <Col xs={12} lg={5}>
                <Form.Group controlId="resource-search">
                  <Form.Label className="form-label-brand">Search all resources</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="e.g. wellbeing, assembly, food"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Form.Group controlId="resource-topic">
                  <Form.Label className="form-label-brand">Topic</Form.Label>
                  <Form.Select value={topic} onChange={(event) => setTopic(event.target.value)}>
                    <option value="">All topics</option>
                    {TOPICS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} lg={2}>
                <Form.Group controlId="resource-ages">
                  <Form.Label className="form-label-brand">Age group</Form.Label>
                  <Form.Select value={ages} onChange={(event) => setAges(event.target.value)}>
                    <option value="">All ages</option>
                    {AGE_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        Ages {group}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} lg={2}>
                <Button
                  type="button"
                  className="btn-outline-sky w-100"
                  disabled={!filtersActive}
                  onClick={() => {
                    setQuery('');
                    setTopic('');
                    setAges('');
                  }}
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>

          <p className="mt-4 mb-3" aria-live="polite" style={{ color: 'var(--muted)', fontWeight: 600 }}>
            {results.length === 1 ? '1 resource' : `${results.length} resources`}
            {filtersActive ? ' match your search' : ''}
          </p>

          {results.length > 0 ? (
            <Row className="g-4">
              {results.map((resource) => (
                <Col md={6} lg={4} key={resource.id}>
                  <ResourceCard resource={resource} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="card-soft auth-card p-4 text-center">
              <p className="mb-2" style={{ fontWeight: 600, color: 'var(--ink)' }}>
                No resources match your search.
              </p>
              <p className="mb-0" style={{ color: 'var(--muted)' }}>
                Try a different word or clear the filters, or email{' '}
                <a href={`mailto:${REQUEST_EMAIL}`} className="link-brand">
                  {REQUEST_EMAIL}
                </a>{' '}
                to tell us what you need.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* TOPICS */}
      <section id="topics" className="py-5 bg-pale-brand anchor-target">
        <Container>
          <RevealBox className="mb-4">
            <p className="section-eyebrow">Explore</p>
            <h2 style={{ fontSize: 28, marginTop: 10 }}>Resources by topic</h2>
          </RevealBox>
          <Row className="g-4">
            {TOPICS.map((t) => {
              const count = RESOURCES.filter((resource) => resource.topic === t.id).length;
              return (
                <Col sm={6} lg={4} key={t.id}>
                  <Card className="card-soft topic-card h-100">
                    <Card.Body className="d-flex flex-column p-4">
                      <Card.Title as="h3" style={{ fontSize: 19 }}>
                        {t.title}
                      </Card.Title>
                      <Card.Text style={{ color: 'var(--muted)', fontSize: 14.5, flexGrow: 1 }}>{t.body}</Card.Text>
                      <Button
                        type="button"
                        variant="link"
                        className="link-brand p-0 text-start stretched-link"
                        onClick={() => showTopic(t.id)}
                      >
                        View {count} {count === 1 ? 'resource' : 'resources'}
                        <span className="visually-hidden"> about {t.title}</span>{' '}
                        <span aria-hidden="true">→</span>
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      {/* WORKSHOPS */}
      <section id="workshops" className="py-5 bg-white anchor-target">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={6}>
              <p className="section-eyebrow">In person</p>
              <h2 style={{ fontSize: 28, marginTop: 10 }}>Workshops for schools and community groups</h2>
              <p style={{ color: 'var(--muted)', marginTop: 12 }}>
                Our team can bring these topics to life in your classroom, youth club or community group in Newham.
              </p>
              <ul className="workshop-list">
                {WORKSHOPS.map((workshop) => (
                  <li key={workshop}>{workshop}</li>
                ))}
              </ul>
              <Button as={Link} to="/contact" className="btn-outline-sky mt-2">
                Ask about a workshop
              </Button>
            </Col>
            <Col lg={6}>
              <div className="hero-image-wrap">
                <img
                  src={IMAGES.foodbankHall}
                  alt="Volunteers at a community food bank handing a crate of groceries to a mother and daughter"
                  style={{ width: '100%', height: 320, objectFit: 'cover' }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SIGN-UP */}
      <section id="sign-up" className="py-5 anchor-target" style={{ background: 'var(--sky-deep)' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={9}>
              <TeachingUpdatesSignup />
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQS */}
      <section id="faqs" className="py-5 bg-pale-brand anchor-target">
        <Container>
          <Row className="justify-content-center">
            <Col lg={9}>
              <h2 style={{ fontSize: 28 }} className="mb-4">
                Frequently asked questions
              </h2>
              <Accordion className="faq-accordion">
                {FAQS.map((faq, index) => (
                  <Accordion.Item eventKey={String(index)} key={faq.q}>
                    <Accordion.Header as="h3">{faq.q}</Accordion.Header>
                    <Accordion.Body style={{ color: 'var(--muted)' }}>{faq.a}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SUPPORT + VOLUNTEER */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="g-4">
            <Col md={6}>
              <div className="card-soft auth-card p-4 h-100 d-flex flex-column">
                <h2 style={{ fontSize: 22 }}>Support community education</h2>
                <p style={{ color: 'var(--muted)', flexGrow: 1 }}>
                  Your gift helps us create new resources and reach more young people across Newham.
                </p>
                <div>
                  <Button type="button" className="btn-navajo" onClick={() => openModal(0)}>
                    Donate
                  </Button>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="card-soft auth-card p-4 h-100 d-flex flex-column">
                <h2 style={{ fontSize: 22 }}>Teach with us</h2>
                <p style={{ color: 'var(--muted)', flexGrow: 1 }}>
                  Teacher or IT professional? Volunteer as a tutor and help run our free classes, tuition and workshops.
                </p>
                <div>
                  <Button as={Link} to="/get-involved/volunteer-tutor" className="btn-outline-sky">
                    Volunteer as a tutor
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

function ResourceCard({ resource }) {
  return (
    <Card className="card-soft resource-card h-100">
      <Card.Body className="d-flex flex-column p-4">
        <p className="resource-topic mb-2">{topicTitle(resource.topic)}</p>
        <Card.Title as="h3" style={{ fontSize: 19 }}>
          {resource.title}
        </Card.Title>
        <ul className="resource-meta" aria-label="Resource details">
          <li>
            <Badge bg="" className="meta-badge">
              Ages {resource.ages}
            </Badge>
          </li>
          <li>
            <Badge bg="" className="meta-badge">
              {resource.format}
            </Badge>
          </li>
          <li>
            <Badge bg="" className="meta-badge">
              {resource.duration}
            </Badge>
          </li>
        </ul>
        <Card.Text style={{ color: 'var(--muted)', fontSize: 14.5, flexGrow: 1 }}>{resource.summary}</Card.Text>
        {resource.href ? (
          <a href={resource.href} className="link-brand" download>
            Download<span className="visually-hidden"> {resource.title}</span>
          </a>
        ) : (
          <a href={requestHref(resource)} className="link-brand">
            Request this resource<span className="visually-hidden">: {resource.title}</span>
          </a>
        )}
      </Card.Body>
    </Card>
  );
}
