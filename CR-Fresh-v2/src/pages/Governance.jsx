import { Container, Row, Col, Button } from 'react-bootstrap';
import RevealBox from '../components/RevealBox';

const FACTS = [
  { label: 'Company name', value: 'Community Rise' },
  { label: 'Company number', value: '17384933' },
  { label: 'Company type', value: 'Private company limited by guarantee' },
  { label: 'Registered office', value: '393a Green Street, Newham, London, E13 9AU' },
  { label: 'Incorporated', value: '6 August 2026' },
  { label: 'Status', value: 'Active' },
];

export default function Governance() {
  return (
    <>
      <section className="page-hero bg-pale-brand">
        <Container>
          <RevealBox>
            <p className="section-eyebrow">Governance &amp; Accountability</p>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginTop: 10, maxWidth: 760 }}>
              Real legal accountability, not an abstract promise.
            </h1>
          </RevealBox>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <RevealBox>
            <Row className="g-5">
              <Col lg={7}>
                <p style={{ fontSize: 16.5, color: 'var(--muted)' }}>
                  Community Rise is governed with the seriousness that public trust demands. Our
                  director and founding members are legally accountable for acting in the
                  charity's best interests, exercising the same duty of care a prudent person
                  would apply to their own affairs, and ensuring funds are used exclusively for
                  our charitable purposes.
                </p>
                <p style={{ fontSize: 16.5, color: 'var(--muted)' }}>
                  This is not an abstract promise. It is a legal commitment formalised at
                  incorporation, when Danyal Aziz, Afan Hussain, and Tooba Qasim each signed a
                  statement of guarantee, personally undertaking to contribute toward the
                  company's debts and liabilities should it ever be wound up.
                </p>
                <p style={{ fontSize: 16.5, color: 'var(--muted)' }}>
                  As our charity grows, we are committed to registering with the Charity
                  Commission for England and Wales and the Fundraising Regulator, publishing
                  annual accounts and a trustees' annual report, and maintaining full transparency
                  with the public we serve.
                </p>
                <Button
                  href="https://find-and-update.company-information.service.gov.uk/company/17384933"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-sky mt-2"
                >
                  Verify us on Companies House &rarr;
                </Button>
              </Col>
              <Col lg={5}>
                <div className="card-soft p-4">
                  <p style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--sky-deep)', fontWeight: 700 }}>
                    REGISTERED DETAILS
                  </p>
                  <dl style={{ marginTop: 12 }}>
                    {FACTS.map((f, i) => (
                      <div key={f.label} style={{
                        display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0',
                        borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                      }}>
                        <dt style={{ fontSize: 13, color: 'var(--muted)' }}>{f.label}</dt>
                        <dd style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink)', textAlign: 'right' }}>
                          {f.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Col>
            </Row>
          </RevealBox>
        </Container>
      </section>
    </>
  );
}
