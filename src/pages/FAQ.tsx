import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQGroup {
  label: string;
  items: FAQItem[];
}

const faqGroups: FAQGroup[] = [
  {
    label: "About the Service",
    items: [
      { q: "Is this real medical care?", a: "Yes. Every consultation is reviewed and prescribed by a licensed physician — not a nurse practitioner, PA, or AI. You receive a real diagnosis and prescription from a doctor who is professionally and legally accountable for your care." },
      { q: "How is this different from going to my regular doctor?", a: "Instead of scheduling, waiting, and having an uncomfortable conversation, you complete a thorough health intake online. Your physician reviews the same information they'd collect in-office and makes the same clinical decision — in a fraction of the time and with complete privacy." },
      { q: "Is this a video visit?", a: "No. This is asynchronous telehealth — you complete your intake at your own pace, and your physician reviews it on their end. No scheduled appointment. No video call. Faster and more private." },
      { q: "What states do you serve?", a: "We currently serve patients located in Tennessee. We are working to expand to additional states." },
    ],
  },
  {
    label: "The Consultation",
    items: [
      { q: "What happens after I pay?", a: "You'll be redirected to a secure medical intake form. Complete the health questionnaire (about 5 minutes). Once submitted, your physician reviews your case within 24 hours. You'll receive an email when your review is complete." },
      { q: "Will I definitely get a prescription?", a: "Not necessarily. Prescriptions are issued at physician discretion based on your health history. If ED medication isn't clinically appropriate for you, your physician will explain why and issue a full refund. Your safety comes first." },
      { q: "What if the doctor has follow-up questions?", a: "Your physician may send a secure message requesting clarification before making a clinical decision. No additional charge. You'll be notified by email to respond in your patient portal." },
    ],
  },
  {
    label: "Treatment and Medication",
    items: [
      { q: "What medications do you prescribe?", a: "We prescribe FDA-approved PDE5 inhibitors including Tadalafil (daily or as-needed), Sildenafil (as-needed), and Vardenafil (as-needed). Your physician recommends the best option based on your health history and preferences." },
      { q: "What's the difference between daily and as-needed?", a: "Daily tadalafil (5mg) is taken every day — you're ready at any time with no planning needed. As-needed medications are taken 30–60 minutes before activity. Daily is popular for spontaneity; as-needed is preferred by men who don't want a daily medication." },
      { q: "Do you prescribe controlled substances?", a: "No. PDE5 inhibitors are not controlled substances. We do not prescribe controlled substances through this platform." },
      { q: "Are these medications safe?", a: "PDE5 inhibitors are among the most studied medications in the world and are safe for the vast majority of healthy men. They are contraindicated in men taking nitrates and require caution with certain heart conditions — which is why a thorough health review is required before prescribing." },
      { q: "What are the side effects?", a: "Common: mild headache, flushing, nasal congestion, mild indigestion — typically resolve within a few hours. Rare but serious: sudden vision/hearing changes, priapism (erection >4 hours — seek emergency care immediately). If you experience chest pain after taking ED medication, call 911." },
    ],
  },
  {
    label: "Privacy and Security",
    items: [
      { q: "Is my information private?", a: "Completely. Your health information is HIPAA-protected and stored on encrypted, HIPAA-compliant servers. We will never sell or share your health information." },
      { q: "How does billing appear on my statement?", a: "Your charge appears discreetly as [BILLING DESCRIPTOR]. No mention of ED, men's health, or medications." },
      { q: "How is my medication packaged?", a: "Plain, unmarked packaging with no indication of contents on the outside." },
      { q: "Do you share my information with my insurance?", a: "No. This is cash-pay only. We do not bill insurance and do not share information with insurers." },
    ],
  },
  {
    label: "Pricing and Billing",
    items: [
      { q: "What does it cost?", a: "$75/month — includes physician review, prescription (if appropriate), pharmacy fulfillment, and secure provider messaging. No hidden fees." },
      { q: "What if I'm not approved?", a: "Full refund if the physician determines you are not a candidate for treatment. You never pay for care you can't receive." },
      { q: "How do I cancel?", a: "Log into your patient portal or email us. No cancellation fee. Takes effect at end of current billing period." },
      { q: "Do you accept insurance?", a: "No. Cash-pay only. Many patients find $75/month is less than their insurance copay for a specialist visit." },
    ],
  },
  {
    label: "Shipping",
    items: [
      { q: "Where does my medication come from?", a: "Licensed compounding pharmacy, shipped directly to you. All pharmacies are licensed and accredited." },
      { q: "How long does shipping take?", a: "Most orders arrive within 3–5 business days of prescription processing." },
    ],
  },
];

const FAQAccordion = ({ items }: { items: FAQItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((faq, i) => (
        <div key={i} className="card-base p-0 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <span className="font-display text-foreground font-semibold pr-4">{faq.q}</span>
            <ChevronDown className={`text-muted-foreground w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-body text-muted-foreground text-sm leading-relaxed px-5 pb-5">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const FAQ = () => (
  <main>
    <section className="page-hero">
      <div className="page-hero-band" />
      <div className="page-hero-content">
        <AnimatedSection>
          <p className="section-label mb-4">SUPPORT</p>
          <h1 className="font-display text-navy text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="font-body text-muted-foreground text-xl">Everything you want to know — answered honestly.</p>
        </AnimatedSection>
      </div>
    </section>

    <section className="section-padding bg-card -mt-8 relative z-10">
      <div className="section-container max-w-3xl space-y-10">
        {faqGroups.map((group, i) => (
          <AnimatedSection key={i} delay={i * 0.05}>
            <span className="inline-block font-body font-semibold badge-teal mb-4 text-base">{group.label}</span>
            <FAQAccordion items={group.items} />
          </AnimatedSection>
        ))}
      </div>
    </section>

    <section className="section-padding bg-off-white text-center">
      <div className="section-container max-w-xl">
        <AnimatedSection>
          <h2 className="section-headline">Still have questions?</h2>
          <p className="font-body text-muted-foreground mb-6">We respond to all inquiries within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-secondary">Contact Us →</Link>
            <Link to="/quiz" className="btn-primary">Start My Consultation — $75 →</Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default FAQ;
