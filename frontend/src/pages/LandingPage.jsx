import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import OpportunitiesShowcase from '../components/landing/OpportunitiesShowcase';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div style={{ background:'var(--bg-primary)', overflowX:'hidden' }}>
      <Navbar />
      {/* Remove spacer on landing — Navbar is transparent over hero */}
      <div style={{ marginTop:'-64px' }}>
        <HeroSection />
      </div>
      <FeaturesSection />
      <HowItWorks />
      <OpportunitiesShowcase />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
