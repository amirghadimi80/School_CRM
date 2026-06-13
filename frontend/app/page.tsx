import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { SchoolsMarquee } from '@/components/landing/schools-marquee';
import { PainPoints } from '@/components/landing/pain-points';
import { RolesShowcase } from '@/components/landing/roles-showcase';
import { Solution } from '@/components/landing/solution';
import { CampusLife } from '@/components/landing/campus-life';
import { BenefitsGrid } from '@/components/landing/benefits-grid';
import { SocialProof } from '@/components/landing/social-proof';
import { HowItWorks } from '@/components/landing/how-it-works';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQSection } from '@/components/landing/faq-section';
import { FinalCTA } from '@/components/landing/final-cta';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      <main>
        <HeroSection />
        <SchoolsMarquee />
        <PainPoints />
        <RolesShowcase />
        <Solution />
        <CampusLife />
        <BenefitsGrid />
        <SocialProof />
        <HowItWorks />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
