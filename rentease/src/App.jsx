import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const Devices = lazy(() => import('./pages/Devices'));
const BookingForm = lazy(() => import('./pages/BookingForm'));
const BookingSummary = lazy(() => import('./pages/BookingSummary'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const KYC = lazy(() => import('./pages/KYC'));
const Claims = lazy(() => import('./pages/Claims'));
const Returns = lazy(() => import('./pages/Returns'));
const Repair = lazy(() => import('./pages/Repair'));
const CorporateRental = lazy(() => import('./pages/CorporateRental'));
const Login = lazy(() => import('./pages/Login'));

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <LoadingScreen />
      <div className="min-h-screen bg-dark-bg flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/devices" element={<PageWrapper><Devices /></PageWrapper>} />
                <Route path="/booking" element={<PageWrapper><BookingForm /></PageWrapper>} />
                <Route path="/booking-summary" element={<PageWrapper><BookingSummary /></PageWrapper>} />
                <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                <Route path="/kyc" element={<PageWrapper><KYC /></PageWrapper>} />
                <Route path="/claims" element={<PageWrapper><Claims /></PageWrapper>} />
                <Route path="/returns" element={<PageWrapper><Returns /></PageWrapper>} />
                <Route path="/repair" element={<PageWrapper><Repair /></PageWrapper>} />
                <Route path="/corporate" element={<PageWrapper><CorporateRental /></PageWrapper>} />
                <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
