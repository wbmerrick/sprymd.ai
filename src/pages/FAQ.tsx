import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { STATEMENT_DESCRIPTOR_DISPLAY } from "@shared/statementDescriptor";
import { pharmacyFulfillmentCopy } from "@/config/pharmacy";
import { applyHead, faqJsonLd } from "@/lib/seo";

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
      { q: "Is this real medical care?", a: "Yes. Every consultation is reviewed by a licensed physician — not AI. Clinical decisions and prescriptions are made by a doctor who is professionally and legally accountable for your care." },
      { q: "How is this different from going to my regular doctor?", a: "Instead of scheduling, waiting, and having an uncomfortable conversation, you complete a thorough health intake online. Your physician reviews the same information they'd collect in-office and makes the same clinical decision — with complete privacy." },
      { q: "Is this a video visit?", a: "Most SpryMD care is asynchronous chart review — you complete a thorough intake; a Tennessee-licensed physician reviews it and messages you with the plan. No scheduled video call for specialty protocols (ED, weight loss, hair, skin, peptides, NAD+). Primary-care (PCP) visits may include a live video visit when clinically appropriate." },
      { q: "What states do you serve?", a: "We currently serve patients located in Tennessee. We are working to expand to additional states." },
      { q: "What can SpryMD help with?", a: "Care options on the platform include men's sexual health (including Wingman), low testosterone, women's health, weight loss, hair loss, skin care, anxiety & depression, sermorelin, NAD+ therapy, and primary-care style visits where offered. Availability of any protocol is always subject to clinician judgment." },
    ],
  },
  {
    label: "Pricing, Billing & Cash-Pay Model",
    items: [
      { q: "What happens after I pay?", a: "Today you pay a one-time clinician visit fee securely with Stripe. Your intake is already complete (or you finish it right after). A Tennessee-licensed physician reviews your case — usually within one business day. You'll get a confirmation email for the payment, then a follow-up when the clinical review is done." },
      { q: "Will I definitely get a prescription?", a: "Not necessarily. Prescriptions are issued only when clinically appropriate. If treatment isn't right for you, your physician will explain why. Visit-fee refunds follow our clinical and billing policy when you are not a candidate." },
      { q: "What if the doctor has follow-up questions?", a: "Your physician may send a secure message requesting clarification before making a clinical decision. No additional charge for clarifying questions during that review." },
    ],
  },
  {
    label: "Prescriptions & Pharmacy Fulfillment",
    items: [
      { q: "What medications do you prescribe?", a: "Depending on your care option and clinical fit, protocols can include PDE5 inhibitors for ED (including combination formulations when appropriate), GLP-1 / dual-agonist weight-loss therapies, hair and skin compounds, and clinician-supervised peptide or NAD+ protocols. Your physician recommends what is safest and most effective for you — or declines when it isn't." },
      { q: "For ED, what's daily vs as-needed?", a: "Daily tadalafil is taken every day so you're ready without planning. As-needed options are taken before activity. Combination protocols (like Wingman) aim for both fast onset and a longer window when clinically appropriate." },
      { q: "Do you prescribe controlled substances?", a: "We do not use this platform as a controlled-substance mill. Controlled substances are only considered when clinically and legally appropriate for a given protocol, and many launch care paths do not include them." },
      { q: "Are these medications safe?", a: "Every protocol has contraindications. That is why a thorough health review is required before prescribing. If your history makes a medication unsafe, we will not prescribe it." },
      { q: "What are the side effects?", a: "Side effects depend on the medication. Your clinician review covers risks specific to your plan. For ED meds, common effects can include headache or flushing; rare serious events need emergency care (call 911). Always read the pharmacy materials that ship with your medication." },
    ],
  },
  {
    label: "Privacy, HIPAA & Security",
    items: [
      { q: "Is my information private?", a: "Your health information is treated as protected health information under applicable law and stored with industry-standard security. We will never sell your health information." },
      { q: "How does billing appear on my statement?", a: `Your charge appears discreetly as ${STATEMENT_DESCRIPTOR_DISPLAY} (some banks add a short merchant prefix). No mention of ED, men's health, or medications.` },
      { q: "How is my medication packaged?", a: "Plain, unmarked packaging with no indication of contents on the outside." },
      { q: "Do you share my information with my insurance?", a: "No. This is cash-pay only. We do not bill insurance and do not share information with insurers for claims." },
    ],
  },
  {
    label: "Pricing and Billing",
    items: [
      { q: "What do I pay today?", a: "A one-time cash-pay clinician visit fee (for example $75 for a basic visit or $99 for a protocol-start visit, depending on what you select). Card details are entered only on Stripe's secure checkout page." },
      { q: "When do I pay for medication?", a: "Medication plan prices shown as “from $X/mo” are what treatment would cost if a clinician approves a plan. Soft launch does not auto-charge medication at checkout. If approved, we coordinate fulfillment and billing for medication separately — clearly, before you are charged for meds." },
      { q: "What if I'm not approved?", a: "If the physician determines you are not a candidate, we follow our refund policy for the visit fee when applicable. Refunds return to your original card; banks may take a few business days to post them." },
      { q: "How do I cancel?", a: "Email support@sprymd.ai or use your patient account. There is no cancellation fee for ending future care. Any active medication billing arrangements (when offered) are cancelled according to the terms shown at that time." },
      { q: "Do you accept insurance?", a: "No. Cash-pay only. Many patients find a single visit fee is less than a specialist copay." },
    ],
  },
  {
    label: "Shipping",
    items: [
      { q: "Where does my medication come from?", a: pharmacyFulfillmentCopy() },
      { q: "How long does shipping take?", a: "After a prescription is approved and transmitted, most orders ship within 1–2 business days and arrive shortly after. Timing depends on the medication, pharmacy, weather, and carrier. Tennessee next-business-day delivery applies only when the order qualifies under our published delivery terms." },
    ],
  },
];

const FAQAccordion = ({ items }: { items: FAQItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((faq, i) => (
        <div key={i} className="card-base p-0 overflow-hidden border border-gray-light">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
          >
            <span className="font-display text-navy font-semibold text-base pr-4">{faq.q}</span>
            <ChevronDown
              className={`text-muted-foreground w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-body text-muted-foreground text-sm leading-relaxed px-5 pb-5 border-t border-gray-light/50 pt-3">
                  {faq.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const FAQ = () => {
  useEffect(() => {
    const items = faqGroups.flatMap((g) => g.items.map((i) => ({ question: i.q, answer: i.a })));
    applyHead({
      pageTitle: "Frequently Asked Questions",
      description:
        "How SpryMD telehealth works: physician review, visit fees, prescriptions, privacy, shipping, and what to expect after your visit.",
      path: "/faq",
      jsonLd: faqJsonLd(items),
    });
  }, []);

  return (
  <main id="main-content">
    <section className="bg-navy py-24 px-4 text-center">
      <div className="section-container">
        <AnimatedSection>
          <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="font-body text-primary-foreground/75 text-base md:text-lg max-w-2xl mx-auto">
            Everything you need to know about SpryMD direct cash-pay telehealth, Tennessee fulfillment, and clinical oversight.
          </p>
        </AnimatedSection>
      </div>
    </section>

    <section className="section-padding bg-card py-12 md:py-16">
      <div className="section-container max-w-3xl space-y-10">
        {faqGroups.map((group, i) => (
          <AnimatedSection key={i} delay={i * 0.05}>
            <span className="inline-block font-body font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full mb-3 text-xs uppercase tracking-wider">
              {group.label}
            </span>
            <FAQAccordion items={group.items} />
          </AnimatedSection>
        ))}
      </div>
    </section>

    <section className="section-padding bg-off-white text-center py-12">
      <div className="section-container max-w-xl">
        <AnimatedSection>
          <h2 className="section-headline">Still have questions?</h2>
          <p className="font-body text-muted-foreground mb-6">We aim to reply within one business day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-secondary">Contact Us →</Link>
            <Link to="/#landing-conditions" className="btn-primary">See care options →</Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
  );
};

export default FAQ;
