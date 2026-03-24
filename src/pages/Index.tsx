import { Link } from "react-router-dom";
import { ClipboardList, Stethoscope, Package, Check, ChevronDown } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HeroSection = () =>
<section className="relative min-h-[90vh] flex items-center justify-center bg-navy overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate to-navy opacity-100" />
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-light/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
    </div>
    <div className="relative z-10 text-center px-4 py-20 max-w-3xl mx-auto">
      <AnimatedSection>
        <p className="section-label text-primary mb-6 tracking-[0.25em]">DISCREET · FAST · PHYSICIAN-REVIEWED</p>
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <h1 className="font-display text-primary-foreground text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
          ED Treatment.<br />Online.<br />In 24 Hours.
        </h1>
      </AnimatedSection>
      <AnimatedSection delay={0.2}>
        <p className="font-body text-primary-foreground/70 text-lg md:text-xl max-w-[560px] mx-auto mb-10">
          Answer a few questions. A board-certified physician reviews your case. FDA-approved medication shipped discreetly to your door — no office visit required.
        </p>
      </AnimatedSection>
      <AnimatedSection delay={0.3}>
        <Link to="/quiz" className="btn-primary-lg shadow-2xl">
          Start My Free Consultation →
        </Link>
        <p className="font-body text-primary-foreground/40 text-sm mt-6">
          🔒 HIPAA-Secure  ·  Licensed Physician  ·  Discreet Shipping  ·  Cancel Anytime
        </p>
      </AnimatedSection>
    </div>
  </section>;


const TrustBar = () =>
<section className="bg-card border-y border-gray-light py-6 px-4">
    <div className="section-container flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
      {["Board-Certified DO Physician", "FDA-Approved Medications", "Ships to Your Door"].map((item, i) =>
    <div key={i} className="flex items-center gap-2">
          <Check className="text-green w-5 h-5 flex-shrink-0" />
          <span className="font-body text-foreground font-medium text-sm">{item}</span>
          {i < 2 && <span className="hidden md:block ml-6 w-px h-5 bg-gray-light" />}
        </div>
    )}
    </div>
  </section>;


const HowItWorks = () => {
  const steps = [
  { num: "01", icon: ClipboardList, title: "Answer a Short Questionnaire", body: "Tell us about your health history in about 5 minutes. No embarrassing office visits. No waiting room. Complete it from anywhere." },
  { num: "02", icon: Stethoscope, title: "A Real Physician Reviews Your Case", body: "[PHYSICIAN NAME], DO personally reviews every consultation within 24 hours and determines the safest, most effective treatment for you." },
  { num: "03", icon: Package, title: "Your Medication Ships to You", body: "If appropriate, your prescription is sent to a licensed pharmacy and shipped in discreet, unmarked packaging — straight to your door." }];


  return (
    <section id="how-it-works" className="section-padding bg-off-white">
      <div className="section-container text-center">
        <AnimatedSection>
          <p className="section-label">THE PROCESS</p>
          <h2 className="section-headline">Getting treatment has never been easier.</h2>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {steps.map((step, i) =>
          <AnimatedSection key={i} delay={i * 0.15}>
              <div className="card-base card-hover text-center h-full">
                <span className="font-display text-5xl text-primary/20 font-light">{step.num}</span>
                <step.icon className="w-10 h-10 text-primary mx-auto mt-4 mb-4" />
                <h3 className="font-display text-foreground text-xl font-semibold mb-3">{step.title}</h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">{step.body}</p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>);

};

const Treatments = () => {
  const cards = [
  { title: "Tadalafil Daily", subtitle: "Once-Daily Freedom", body: "Take it every day and be ready whenever the moment is right. No planning. No timing. Just confidence.", detail: "5mg · Daily dosing", price: "From $75/month", popular: true },
  { title: "Sildenafil", subtitle: "When You Need It", body: "Take it 30–60 minutes before intimacy. Works for 4–6 hours. Flexible and effective.", detail: "25–100mg · As-needed", price: "From $75/month", popular: false },
  { title: "Tadalafil As-Needed", subtitle: "The Weekend Option", body: "Take it before intimacy and stay ready for up to 36 hours. Ideal for planned occasions.", detail: "10–20mg · As-needed", price: "From $75/month", popular: false }];


  return (
    <section id="treatments" className="section-padding bg-card">
      <div className="section-container text-center">
        <AnimatedSection>
          <p className="section-label">TREATMENTS</p>
          <h2 className="section-headline">FDA-Approved ED Treatment, Personalized for You.</h2>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {cards.map((card, i) =>
          <AnimatedSection key={i} delay={i * 0.15}>
              <div className="card-base card-hover relative h-full flex flex-col">
                {card.popular &&
              <span className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-semibold font-body px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
              }
                <h3 className="font-display text-foreground text-2xl font-bold mb-1">{card.title}</h3>
                <p className="font-body text-primary font-medium text-sm mb-4">{card.subtitle}</p>
                <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{card.body}</p>
                <p className="font-body text-muted-foreground text-xs mb-2">{card.detail}</p>
                <p className="font-display text-foreground text-lg font-bold mb-6">{card.price}</p>
                <Link to="/quiz" className="btn-primary w-full">Get Started →</Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>);

};

const WhyChooseUs = () => {
  const features = [
  "Real physician review — not an algorithm",
  "Results within 24 hours",
  "$75/month — no surprise fees",
  "Discreet billing and shipping",
  "Cancel or pause anytime",
  "Licensed in Tennessee"];


  return (
    <section className="section-padding bg-navy">
      <div className="section-container text-center">
        <AnimatedSection>
          <h2 className="font-display text-primary-foreground text-3xl md:text-[42px] font-bold leading-tight mb-6">
            Not a Staffing Agency. A Real Doctor Who Cares.
          </h2>
          <p className="font-body text-primary-foreground/70 text-lg max-w-[600px] mx-auto mb-4">At SPRYMD.AI, you're not filling out a form that gets routed to whoever is available. A board-certified physician personally reviews every case — every prescription, every follow-up.

          </p>
          <p className="font-body text-primary-foreground/70 text-lg max-w-[600px] mx-auto mb-12">
            That means better clinical judgment, more personalized care, and a physician who is accountable to you — not a quota.
          </p>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {features.map((feature, i) =>
          <AnimatedSection key={i} delay={i * 0.1}>
              <div className="bg-card/10 border border-primary-foreground/10 rounded-xl p-5 text-left">
                <div className="flex items-start gap-3">
                  <Check className="text-green w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="font-body text-primary-foreground text-sm font-medium">{feature}</span>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>);

};

const PricingSection = () => {
  const items = [
  "Physician-reviewed consultation",
  "Prescription (if clinically appropriate)",
  "Licensed pharmacy fulfillment",
  "Secure provider messaging",
  "Monthly auto-refills",
  "Cancel anytime — no penalty"];


  return (
    <section className="section-padding bg-off-white">
      <div className="section-container text-center">
        <AnimatedSection>
          <p className="section-label">PRICING</p>
          <h2 className="section-headline">Transparent Pricing. No Hidden Fees.</h2>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <div className="card-base shadow-xl max-w-[480px] mx-auto p-12 rounded-3xl">
            <div className="mb-6">
              <span className="font-display text-foreground text-7xl md:text-8xl font-bold">$75</span>
              <span className="font-body text-muted-foreground text-2xl">/month</span>
            </div>
            <div className="w-full h-px bg-gray-light mb-6" />
            <ul className="text-left space-y-3 mb-8">
              {items.map((item, i) =>
              <li key={i} className="flex items-center gap-3">
                  <Check className="text-green w-5 h-5 flex-shrink-0" />
                  <span className="font-body text-foreground text-sm">{item}</span>
                </li>
              )}
            </ul>
            <Link to="/quiz" className="btn-primary w-full">Start My Consultation →</Link>
            <p className="font-body text-muted-foreground text-xs mt-4">
              Cash-pay only. We do not bill insurance. Prescription issuance is at physician discretion based on your health history.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>);

};

const FAQTeaser = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
  { q: "Is this real medical care?", a: "Yes. Every consultation is reviewed by a licensed, board-certified physician — not a chatbot or algorithm. You receive a real prescription from a real doctor who is professionally and legally accountable for your care." },
  { q: "Is it completely private?", a: "Completely. Your information is HIPAA-protected, stored on encrypted servers, billed discreetly, and shipped in unmarked packaging. We will never share your health information." },
  { q: "What if I'm not a good candidate?", a: "If our physician determines that ED medication isn't clinically appropriate based on your health history, we'll explain why and issue a full refund. Your safety matters more than a transaction." }];


  return (
    <section className="section-padding bg-card">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <h2 className="font-display text-foreground text-3xl md:text-4xl font-bold text-center mb-10">Common Questions</h2>
        </AnimatedSection>
        <div className="space-y-4">
          {faqs.map((faq, i) =>
          <AnimatedSection key={i} delay={i * 0.1}>
              <div className="card-base p-0 overflow-hidden">
                <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left">
                
                  <span className="font-display text-foreground text-lg font-semibold pr-4">{faq.q}</span>
                  <ChevronDown className={`text-muted-foreground w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openIndex === i &&
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}>
                  
                      <p className="font-body text-muted-foreground text-sm leading-relaxed px-6 pb-6">{faq.a}</p>
                    </motion.div>
                }
                </AnimatePresence>
              </div>
            </AnimatedSection>
          )}
        </div>
        <div className="text-center mt-8">
          <Link to="/faq" className="font-body text-primary font-semibold hover:text-blue-light transition-colors">
            See all FAQs →
          </Link>
        </div>
      </div>
    </section>);

};

const FooterCTA = () =>
<section className="section-padding bg-navy text-center">
    <div className="section-container">
      <AnimatedSection>
        <h2 className="font-display text-primary-foreground text-3xl md:text-5xl font-bold mb-4">Ready to get started?</h2>
        <p className="font-body text-primary-foreground/70 text-lg mb-8">
          Take the first step. It takes less than 5 minutes.
        </p>
        <Link to="/quiz" className="btn-primary-lg">
          Start My Consultation — $75 →
        </Link>
      </AnimatedSection>
    </div>
  </section>;


const Index = () =>
<main>
    <HeroSection />
    <TrustBar />
    <HowItWorks />
    <Treatments />
    <WhyChooseUs />
    <PricingSection />
    <FAQTeaser />
    <FooterCTA />
  </main>;


export default Index;