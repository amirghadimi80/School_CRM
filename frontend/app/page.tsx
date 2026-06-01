import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { PainPoints } from '@/components/landing/pain-points';
import { Solution } from '@/components/landing/solution';
import { BenefitsGrid } from '@/components/landing/benefits-grid';
import { SocialProof } from '@/components/landing/social-proof';
import { HowItWorks } from '@/components/landing/how-it-works';
import { PricingSection } from '@/components/landing/pricing-section';
import { UrgencyTimer } from '@/components/landing/urgency-timer';
import { FAQSection } from '@/components/landing/faq-section';
import { FinalCTA } from '@/components/landing/final-cta';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <HeroSection />
        <PainPoints />
        <Solution />
        <BenefitsGrid />
        <SocialProof />
        <HowItWorks />
        <PricingSection />
        <UrgencyTimer />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
