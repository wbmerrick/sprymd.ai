import AnimatedSection from "@/components/AnimatedSection";

const NPP = () => (
  <main className="min-h-screen bg-off-white">
    <section className="bg-navy py-20 px-4 text-center">
      <div className="section-container max-w-4xl">
        <h1 className="font-display text-primary-foreground text-3xl md:text-5xl font-bold mb-3">
          Notice of Privacy Practices
        </h1>
        <p className="font-body text-primary-foreground/75 text-sm md:text-base max-w-2xl mx-auto">
          THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.
        </p>
      </div>
    </section>

    <section className="section-padding bg-card py-12 md:py-16">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none space-y-6 text-navy">
            <div className="bg-muted/40 border border-border rounded-xl p-4 text-xs leading-relaxed text-muted-foreground">
              <p><strong>Effective Date:</strong> March 27, 2026</p>
              <p><strong>Covered Entities & Practice Group:</strong> SpryMD Telehealth Tennessee P.C. & affiliated licensed medical providers (collectively, "SpryMD," "we," "our," or "us").</p>
              <p><strong>Privacy Officer Contact:</strong> <a href="mailto:privacy@sprymd.ai" className="text-primary underline">privacy@sprymd.ai</a> · (615) 802-7779 · 414 Union Street, Suite 1900, Nashville, TN 37219</p>
            </div>

            <h2 className="text-xl font-bold text-navy mt-8 mb-2">1. Our Legal Duty</h2>
            <p>
              We are required by the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and applicable state laws to maintain the privacy and security of your Protected Health Information ("PHI"). We are also required to provide you with this Notice of Privacy Practices explaining our legal duties and privacy practices with respect to PHI, and to notify affected individuals following a breach of unsecured PHI.
            </p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-2">2. How We May Use and Disclose Your PHI</h2>
            <p>We may use and disclose your PHI for treatment, payment, and healthcare operations without your written authorization in the following ways:</p>
            
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Treatment:</strong> We use your health intake questionnaire, symptom reports, vital readings, and medical history to evaluate your clinical eligibility, make diagnoses, formulate treatment protocols, and prescribe medications. We share PHI with our dispensing pharmacy partner (Empower Pharmacy) to fulfill and ship your prescriptions.
              </li>
              <li>
                <strong>Payment (100% Direct Cash-Pay):</strong> Because SpryMD operates on a 100% direct-to-consumer cash-pay basis, we do not bill commercial health insurers, Medicare, or Medicaid. We process payment directly through secure, PCI-DSS compliant payment gateways (Stripe) to bill your credit card and generate itemized cash-pay receipts with clinician NPI.
              </li>
              <li>
                <strong>Healthcare Operations:</strong> We use your PHI to evaluate the quality of care provided by our clinicians, conduct clinical audits, maintain secure electronic health records, and continuously improve platform safety.
              </li>
              <li>
                <strong>Business Associates:</strong> We share PHI with trusted third-party vendors (such as cloud hosting, pharmacy dispensing partners, and encrypted database providers) who have executed formal HIPAA Business Associate Agreements (BAAs) pledging to safeguard your data.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8 mb-2">3. Uses & Disclosures Requiring Your Specific Authorization</h2>
            <p>
              We will never sell your PHI, use your PHI for third-party marketing, or share psychotherapy notes without your explicit written authorization. You may revoke any authorization in writing at any time.
            </p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-2">4. Your Health Information Rights</h2>
            <p>Under HIPAA and Tennessee medical privacy laws, you have the following rights regarding your PHI:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Right to Inspect & Copy:</strong> You have the right to inspect and obtain an electronic or paper copy of your medical chart, intake responses, and billing history. You can view your active records anytime in your SpryMD patient portal or email us.</li>
              <li><strong>Right to Request Amendments:</strong> If you believe information in your chart is inaccurate or incomplete, you may submit a written request for an amendment.</li>
              <li><strong>Right to an Accounting of Disclosures:</strong> You have the right to request an accounting of disclosures of your PHI made outside of treatment, payment, and healthcare operations.</li>
              <li><strong>Right to Request Restrictions:</strong> You have the right to request restrictions on how we use or disclose your PHI. Because you pay out-of-pocket in full (cash-pay), we will never disclose your care records to a health insurance plan without your written instruction.</li>
              <li><strong>Right to Confidential Communications:</strong> You have the right to request that we communicate with you via specific secure channels (e.g. encrypted in-app messaging or private email).</li>
              <li><strong>Right to a Paper Copy:</strong> You may request a paper copy of this Notice at any time.</li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8 mb-2">5. State of Tennessee Specific Disclosures</h2>
            <p>
              Under Tennessee Code Annotated § 63-6-241 and § 63-9-123, telehealth medical consultations conducted for patients located in Tennessee are governed by the Tennessee Board of Medical Examiners and Board of Osteopathic Examination. Prescriptions issued by SpryMD clinicians comply with Tennessee electronic prescribing mandates and controlled substance restrictions.
            </p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-2">6. Complaints & Privacy Officer Contact</h2>
            <p>
              If you believe your privacy rights have been violated, you may file a complaint with our Privacy Officer or with the Secretary of the U.S. Department of Health and Human Services (HHS) Office for Civil Rights. <strong>We will never retaliate against you for filing a complaint.</strong>
            </p>
            <div className="bg-muted/40 p-4 rounded-xl border border-border text-xs space-y-1">
              <p className="font-bold text-navy">SpryMD Privacy Officer</p>
              <p>SpryMD Telehealth Tennessee P.C.</p>
              <p>414 Union Street, Suite 1900, Nashville, TN 37219</p>
              <p>Phone: (615) 802-7779 · Email: <a href="mailto:privacy@sprymd.ai" className="text-primary underline">privacy@sprymd.ai</a></p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default NPP;
