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
      { q: "Is this real medical care?", a: "Yes. Every consultation and chart review is conducted by a licensed physician — not a mid-level triage bot or unregulated algorithm. You receive a legally binding diagnosis and e-prescription from a doctor licensed in Tennessee who is clinically accountable for your care." },
      { q: "How is this different from going to an in-person clinic?", a: "Instead of waiting weeks for an appointment and sitting in a waiting room, you complete a comprehensive medical intake online. Your physician reviews the same clinical information collected in-office and determines your protocol with total privacy and speed." },
      { q: "Is a video call required?", a: "No. Under Tennessee medical rules, asynchronous telehealth intake allows you to complete your questionnaire on your own schedule. Your physician reviews your full chart and medical history within 24 hours. If they have clinical follow-up questions, they message you securely in your patient portal." },
      { q: "What states do you serve?", a: "We currently serve patients physically located in Tennessee. Protocols are tailored to Tennessee clinical and electronic prescribing standards." },
    ],
  },
  {
    label: "Pricing, Billing & Cash-Pay Model",
    items: [
      { q: "How much do SpryMD protocols cost?", a: "All protocols are 100% direct cash-pay subscriptions with transparent pricing: Primary Care Membership ($120/mo), GLP-1 Weight Loss ($200/mo), ED PDE5 Protocol ($75/mo), Low Testosterone Optimization ($99/mo), NAD+ Protocol ($149/mo), and Sermorelin Peptides ($199/mo). Pricing includes physician review, compounding, cold-chain packaging (if applicable), and unlimited care messaging." },
      { q: "Do you accept or bill health insurance?", a: "No. SpryMD is 100% direct-to-consumer cash-pay. We do not bill commercial insurance, Medicare, or Medicaid, nor do we route through third-party Revenue Cycle Management (RCM) billing networks. This keeps pricing predictable and eliminates prior-authorization delays." },
      { q: "Can I use HSA or FSA funds?", a: "Yes. Most SpryMD clinical consultations, compounded prescription protocols, and FDA-cleared devices are qualified medical expenses. You can download an itemized cash-pay receipt with clinician NPI directly from your portal to submit for reimbursement." },
      { q: "What happens if a physician does not approve my treatment?", a: "If our physician determines that a medication is not clinically appropriate for you (e.g. nitrate contraindications or cardiovascular risks), your authorization hold is released immediately and you receive a 100% full refund. You never pay for care you cannot safely receive." },
      { q: "How do I cancel or pause my subscription?", a: "You can pause or cancel anytime with one click in your patient portal dashboard under Subscriptions, or by messaging support. There are zero cancellation fees or long-term contracts." },
    ],
  },
  {
    label: "Prescriptions & Pharmacy Fulfillment",
    items: [
      { q: "Where is my medication compounded and shipped from?", a: "All compounded prescriptions are fulfilled through Empower Pharmacy (a licensed 503A / 503B compounding facility) and accredited dispensing partners. All medications adhere to strict cGMP sterility and potency standards." },
      { q: "How fast is shipping in Tennessee?", a: "Prescriptions for Tennessee residents are routed for Next-Business-Day fulfillment. Temperature-sensitive injectables (such as Tirzepatide, Semaglutide, and Sermorelin) ship in insulated cold-chain packaging with ice packs." },
      { q: "How are packages labeled?", a: "All orders ship in discreet, tamper-evident, unmarked boxes with no mention of medications, treatment conditions, or SpryMD branding on the outside." },
      { q: "How do Quick Refills work?", a: "Returning patients with active prescriptions on file can order same-day refills directly from their dashboard without filling out a new intake questionnaire, as long as refills remain authorized." },
    ],
  },
  {
    label: "Privacy, HIPAA & Security",
    items: [
      { q: "Is my Protected Health Information (PHI) secure?", a: "Yes. All health data is encrypted in transit and at rest using AES-256 standards in full compliance with HIPAA. Access to your clinical records is strictly restricted to your licensed provider and pharmacy team with immutable audit logging." },
      { q: "How does billing appear on my credit card statement?", a: "Charges appear discreetly as 'SPRYMD HEALTH' with no mention of specific medications, conditions, or diagnosis codes." },
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

const FAQ = () => (
  <main className="min-h-screen bg-off-white">
    <section className="bg-navy py-20 px-4 text-center">
      <div className="section-container max-w-4xl">
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
          <h2 className="section-headline text-2xl md:text-3xl font-bold text-navy mb-2">
            Have more questions?
          </h2>
          <p className="font-body text-muted-foreground text-sm mb-6">
            Our Nashville medical operations team responds to all inquiries within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-secondary text-sm">Contact Clinic →</Link>
            <Link to="/quiz" className="btn-primary text-sm">Start Medical Intake →</Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default FAQ;
