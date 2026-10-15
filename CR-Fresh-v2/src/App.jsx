import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DonationModalProvider } from './context/DonationModalContext';
import SiteNavbar from './components/Navbar';
import Footer from './components/Footer';
import DonationModal from './components/DonationModal';
import ScrollToTop from './components/ScrollToTop';
import GuestRoute from './components/auth/GuestRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

import Home from './pages/Home';
import About from './pages/About';
import CommunitySupport from './pages/services/CommunitySupport';
import AdviceSignposting from './pages/services/AdviceSignposting';
import YouthEngagement from './pages/services/YouthEngagement';
import WellbeingInclusion from './pages/services/WellbeingInclusion';
import GetInvolved from './pages/GetInvolved';
import TeachingResources from './pages/TeachingResources';
import Events from './pages/Events';
import VolunteerTutor from './pages/VolunteerTutor';
import AdminTutorApplications from './pages/admin/TutorApplications';
import Governance from './pages/Governance';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/account/Dashboard';
import Account from './pages/account/Account';

export default function App() {
  return (
    <AuthProvider>
      <DonationModalProvider>
        <ScrollToTop />
        <SiteNavbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services/community-support" element={<CommunitySupport />} />
            <Route path="/services/advice-signposting" element={<AdviceSignposting />} />
            <Route path="/services/youth-engagement" element={<YouthEngagement />} />
            <Route path="/services/wellbeing-inclusion" element={<WellbeingInclusion />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/get-involved/teaching-resources" element={<TeachingResources />} />
            <Route path="/get-involved/events" element={<Events />} />
            <Route path="/get-involved/volunteer-tutor" element={<VolunteerTutor />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/contact" element={<Contact />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/account" element={<Account />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin/tutor-applications" element={<AdminTutorApplications />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <DonationModal />
      </DonationModalProvider>
    </AuthProvider>
  );
}
