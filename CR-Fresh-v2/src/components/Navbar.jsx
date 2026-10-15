import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDonationModal } from '../context/DonationModalContext';
import { firstName } from '../utils/redirect';
import logoIcon from '../assets/images/logo-icon.png';

export default function SiteNavbar() {
  const { openModal } = useDonationModal();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

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

            <NavDropdown
              title="Get Involved"
              id="get-involved-dropdown"
              active={pathname.startsWith('/get-involved')}
              style={{ fontWeight: 600 }}
            >
              <NavDropdown.Item as={NavLink} to="/get-involved" end>
                Ways to get involved
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as="button" type="button" onClick={() => openModal(0)}>
                Donate
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/get-involved#volunteer">
                Volunteer
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/get-involved/volunteer-tutor">
                Volunteer as a Tutor
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/get-involved/teaching-resources">
                Teaching Resources
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/get-involved#fundraise">
                Fundraising
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/get-involved/events">
                Events
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={NavLink} to="/governance" style={{ fontWeight: 600, color: 'var(--ink)' }}>
              Governance
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact" style={{ fontWeight: 600, color: 'var(--ink)' }}>
              Contact
            </Nav.Link>

            {/* Sign-up and log-in live on the Teaching Resources page; logged-in
                users get an account menu here. */}
            {!loading && user && (
              <NavDropdown
                title={firstName(user.full_name)}
                id="account-dropdown"
                align="end"
                className="ms-lg-2"
                style={{ fontWeight: 600 }}
              >
                <NavDropdown.Item as={NavLink} to="/dashboard">
                  Dashboard
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/account">
                  Account
                </NavDropdown.Item>
                {user.role === 'admin' && (
                  <NavDropdown.Item as={NavLink} to="/admin/tutor-applications">
                    Tutor applications
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item as="button" type="button" onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}

            <Button className="btn-navajo ms-lg-3 mt-3 mt-lg-0" onClick={() => openModal(0)}>
              Donate
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
