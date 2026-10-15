import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Col, Container, Form, Nav, Row, Spinner } from 'react-bootstrap';
import { getErrorMessage } from '../../api/errors';
import { listApplications, updateApplication } from '../../api/tutorApplications';
import FormStatus from '../../components/auth/FormStatus';
import { APPLICATION_STATUSES, LABELS, labelList } from '../../data/tutoring';

const STATUS_VARIANT = { new: 'primary', contacted: 'info', approved: 'success', declined: 'secondary' };
const FILTERS = [{ value: '', label: 'All' }, ...APPLICATION_STATUSES];

const formatDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );

export default function TutorApplications() {
  const [filter, setFilter] = useState('new');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (status) => {
    setLoading(true);
    setError('');
    try {
      const res = await listApplications(status);
      setApplications(res.data.applications);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const replace = (updated) =>
    setApplications((list) =>
      filter && updated.status !== filter
        ? list.filter((a) => a.id !== updated.id)
        : list.map((a) => (a.id === updated.id ? updated : a)),
    );

  return (
    <section className="page-hero bg-pale-brand" style={{ paddingBottom: 80 }}>
      <Container>
        <p className="section-eyebrow mb-2">Admin</p>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)' }}>Volunteer tutor applications</h1>

        <Nav variant="pills" className="admin-filters my-4" as="ul" aria-label="Filter by status">
          {FILTERS.map((option) => (
            <Nav.Item as="li" key={option.value || 'all'}>
              <Nav.Link
                as="button"
                type="button"
                active={filter === option.value}
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <FormStatus message={error} />

        <div aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="py-5 text-center">
              <Spinner animation="border" style={{ color: 'var(--sky-deep)' }} aria-hidden="true" />
              <span className="visually-hidden">Loading applications…</span>
            </div>
          ) : applications.length === 0 ? (
            <p className="card-soft auth-card p-4" style={{ color: 'var(--muted)' }}>
              No {filter ? LABELS.status[filter].toLowerCase() : ''} applications.
            </p>
          ) : (
            <>
              <p style={{ color: 'var(--muted)', fontWeight: 600 }}>
                {applications.length} {applications.length === 1 ? 'application' : 'applications'}
              </p>
              {applications.map((application) => (
                <ApplicationCard key={application.id} application={application} onUpdated={replace} />
              ))}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}

function ApplicationCard({ application, onUpdated }) {
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.admin_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dirty = status !== application.status || notes !== (application.admin_notes ?? '');

  const save = async (event) => {
    event.preventDefault();
    if (saving || !dirty) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await updateApplication(application.id, { status, admin_notes: notes });
      setMessage('Saved.');
      onUpdated(res.data.application);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const id = `application-${application.id}`;

  return (
    <article className="card-soft auth-card p-4 mb-3" aria-labelledby={`${id}-name`}>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
        <div>
          <h2 id={`${id}-name`} style={{ fontSize: 20 }} className="mb-1">
            {application.full_name}
          </h2>
          <p className="mb-0" style={{ fontSize: 14, color: 'var(--muted)' }}>
            Applied {formatDate(application.created_at)}
            {application.has_account ? ' · Has an account' : ''}
          </p>
        </div>
        <Badge bg={STATUS_VARIANT[application.status]}>{LABELS.status[application.status]}</Badge>
      </div>

      <dl className="account-details my-3">
        <dt>Email</dt>
        <dd>
          <a href={`mailto:${application.email}`} className="link-brand">
            {application.email}
          </a>
        </dd>
        <dt>Phone</dt>
        <dd>
          <a href={`tel:${application.phone.replace(/[^\d+]/g, '')}`} className="link-brand">
            {application.phone}
          </a>
        </dd>
        <dt>Subjects</dt>
        <dd>{labelList('subjects', application.subjects)}</dd>
        <dt>Learners</dt>
        <dd>{labelList('learner_groups', application.learner_groups)}</dd>
        <dt>Availability</dt>
        <dd>{labelList('availability', application.availability)}</dd>
        <dt>Teaching</dt>
        <dd>{LABELS.delivery[application.delivery]}</dd>
        <dt>DBS</dt>
        <dd>{LABELS.dbs_status[application.dbs_status]}</dd>
        <dt>Experience</dt>
        <dd style={{ whiteSpace: 'pre-wrap' }}>{application.experience}</dd>
      </dl>

      <Form onSubmit={save} aria-label={`Review ${application.full_name}`}>
        <Row className="g-3 align-items-end">
          <Col sm={4}>
            <Form.Group controlId={`${id}-status`}>
              <Form.Label className="form-label-brand">Status</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {APPLICATION_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col sm={8}>
            <Form.Group controlId={`${id}-notes`}>
              <Form.Label className="form-label-brand">Notes (team only)</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                maxLength={2000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex align-items-center gap-3 mt-3">
          <Button type="submit" className="btn-navajo" disabled={saving || !dirty} aria-busy={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <span aria-live="polite" style={{ fontSize: 14, color: 'var(--muted)' }}>
            {message}
          </span>
        </div>
        <FormStatus message={error} className="mt-3 mb-0" />
      </Form>
    </article>
  );
}
