import { Container, Row, Col } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--sky-deep)', color: 'rgba(255,255,255,0.85)', paddingTop: 48, paddingBottom: 24 }}>
      <Container>
        <Row className="pb-4 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
          <Col md={4} className="mb-4 mb-md-0">
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--white)', fontWeight: 800 }}>
              Community Rise
            </p>
            <p style={{ fontSize: 14 }}>
              A Newham-based charitable company helping local people rise above hardship,
              together.
            </p>
          </Col>
          <Col md={3} className="mb-4 mb-md-0">
            <p style={{ fontSize: 12, letterSpacing: '0.06em', color: 'var(--navajo)', fontWeight: 700 }}>QUICK LINKS</p>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><NavLink to="/about" style={{ color: 'inherit' }}>About Us</NavLink></li>
              <li><NavLink to="/services/community-support" style={{ color: 'inherit' }}>Our Services</NavLink></li>
              <li><NavLink to="/get-involved" style={{ color: 'inherit' }}>Get Involved</NavLink></li>
              <li><NavLink to="/governance" style={{ color: 'inherit' }}>Governance</NavLink></li>
            </ul>
          </Col>
          <Col md={5}>
            <p style={{ fontSize: 12, letterSpacing: '0.06em', color: 'var(--navajo)', fontWeight: 700 }}>CONTACT</p>
            <p style={{ fontSize: 14, lineHeight: 1.8 }}>
              393a Green Street, Newham, London, E13 9AU
            </p>
            <a href="mailto:help@communityrise.org.uk" style={{ fontSize: 14, color: 'var(--navajo)', fontWeight: 600 }}>
              help@communityrise.org.uk
            </a>
          </Col>
        </Row>

        <div style={{ fontSize: 12.5, lineHeight: 1.9, color: 'rgba(255,255,255,0.55)' }}>
          <p>
            Community Rise &middot; Registered in England and Wales, company number 17384933 &middot;
            Incorporated 6 August 2026 &middot; Registered office: 393a Green Street, Newham, London, E13 9AU.
          </p>
          <p>
            Registered charity number to follow, pending registration with the Charity Commission for England and Wales.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
            &copy; {new Date().getFullYear()} Community Rise. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
