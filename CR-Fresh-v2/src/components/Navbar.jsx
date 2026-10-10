import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useDonationModal } from '../context/DonationModalContext';
import logoIcon from '../assets/images/logo-icon.png';

export default function SiteNavbar() {
  const { openModal } = useDonationModal();

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand
          as={NavLink}
          to="/"
          className="d-flex align-items-center"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--ink)', fontSize: 22, gap: 8 }}
        >
          <img src={logoIcon} alt="Community Rise" style={{ height: 46, width: 'auto' }} />
          Community <span style={{ color: 'var(--sky-deep)' }}>Rise</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center" style={{ gap: '4px' }}>
            <Nav.Link as={NavLink} to="/" end style={{ fontWeight: 600, color: 'var(--ink)' }}>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about" style={{ fontWeight: 600, color: 'var(--ink)' }}>
              About Us
            </Nav.Link>

            <NavDropdown title="Services" id="services-dropdown" style={{ fontWeight: 600 }}>
              <NavDropdown.Item as={NavLink} to="/services/community-support">
                Community Support
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/services/advice-signposting">
                Advice &amp; Signposting
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/services/youth-engagement">
                Youth Engagement
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/services/wellbeing-inclusion">
                Wellbeing &amp; Inclusion
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={NavLink} to="/get-involved" style={{ fontWeight: 600, color: 'var(--ink)' }}>
              Get Involved
            </Nav.Link>
            <Nav.Link as={NavLink} to="/governance" style={{ fontWeight: 600, color: 'var(--ink)' }}>
              Governance
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact" style={{ fontWeight: 600, color: 'var(--ink)' }}>
              Contact
            </Nav.Link>

            <Button className="btn-navajo ms-lg-3 mt-3 mt-lg-0" onClick={() => openModal(0)}>
              Donate
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
