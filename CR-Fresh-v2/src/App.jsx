import { Routes, Route } from 'react-router-dom';
import { DonationModalProvider } from './context/DonationModalContext';
import SiteNavbar from './components/Navbar';
import Footer from './components/Footer';
import DonationModal from './components/DonationModal';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import About from './pages/About';
import CommunitySupport from './pages/services/CommunitySupport';
import AdviceSignposting from './pages/services/AdviceSignposting';
import YouthEngagement from './pages/services/YouthEngagement';
import WellbeingInclusion from './pages/services/WellbeingInclusion';
import GetInvolved from './pages/GetInvolved';
import Governance from './pages/Governance';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
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
          <Route path="/governance" element={<Governance />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <DonationModal />
    </DonationModalProvider>
  );
}
