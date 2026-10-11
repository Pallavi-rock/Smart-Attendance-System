import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Statistics from "../components/Statistics";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";
import CTA from "../components/CTA";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      <Statistics />
      <FAQ />
      <Contact />
      <CTA />
    </div>
  );
}
