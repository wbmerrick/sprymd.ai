import AnimatedSection from "@/components/AnimatedSection";

import { COMPANY, COMPANY_CITY_STATE_ZIP } from "@/lib/company";

const NPP = () => (
  <main>
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">
        Notice of Privacy Practices
      </h1>
      <p className="font-body text-primary-foreground/70 mt-3">
        William Merrick, DO — Telehealth Practice
      </p>
    </section>
    <section className="section-padding bg-card">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none">
            <p className="text-lg font-medium text-foreground mb-4">Effective Date: March 27, 2026</p>

            <p className="font-semibold text-foreground">
              THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND
              HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Who must follow this notice</h2>
            <p>
              This Notice of Privacy Practices (<strong>"Notice"</strong>) applies to William Merrick,
              DO and authorized members of the workforce who provide telehealth services through
              SpryMD.ai (<strong>"we," "us,"</strong> or <strong>"our practice"</strong>). SpryMD
              Technologies, LLC operates the technology platform; clinical decisions and your medical
              record are maintained by the practice.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Our pledge regarding your medical information</h2>
            <p>
              We understand that medical information about you is personal. We are committed to
              protecting the privacy of your protected health information (<strong>"PHI"</strong>) and
              to providing you with this Notice of our legal duties and privacy practices with respect
              to PHI as required by the Health Insurance Portability and Accountability Act of 1996
              (<strong>"HIPAA"</strong>) and applicable state law.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">How we may use and disclose PHI</h2>
            <p>We may use and disclose your PHI for the following purposes without your written authorization:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Treatment</strong> — To provide, coordinate, or manage your healthcare and related services, including consultation with pharmacies, laboratories, or other providers involved in your care.</li>
              <li><strong>Payment</strong> — To obtain payment for services, including billing insurers or collecting fees through payment processors. Payment data is kept separate from clinical charts where feasible.</li>
              <li><strong>Health care operations</strong> — Quality assessment, training, licensing, compliance audits, and business planning that supports treatment and payment activities.</li>
              <li><strong>Appointment reminders and care communications</strong> — Including secure messaging, email, or SMS about visits, lab results, or prescription status as permitted by law.</li>
            </ul>

            <p className="font-semibold text-foreground mt-4">Other uses and disclosures</p>
            <p>We may also use or disclose PHI:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>As required by law (court orders, public health reporting, abuse reporting).</li>
              <li>To avert a serious threat to health or safety.</li>
              <li>For workers' compensation or similar programs.</li>
              <li>To business associates who perform services for us under a written BAA (e.g., platform hosting, secure messaging vendors).</li>
            </ul>
            <p className="mt-2">
              Uses and disclosures not described in this Notice will be made only with your written
              authorization. You may revoke authorization in writing, except to the extent we have
              already relied on it.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Your rights</h2>
            <p>You have the following rights regarding PHI we maintain about you:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Right to access</strong> — Request copies of your medical record, subject to limited exceptions.</li>
              <li><strong>Right to amend</strong> — Request correction of PHI you believe is incorrect or incomplete.</li>
              <li><strong>Right to an accounting of disclosures</strong> — Request a list of certain disclosures we made.</li>
              <li><strong>Right to request restrictions</strong> — Ask us to limit how we use or disclose PHI for treatment, payment, or operations. We are not required to agree except in limited circumstances.</li>
              <li><strong>Right to confidential communications</strong> — Request that we contact you at alternative addresses or by alternative means.</li>
              <li><strong>Right to a paper copy</strong> — You may request a paper copy of this Notice at any time.</li>
              <li><strong>Right to be notified of a breach</strong> — We will notify you as required if a breach of unsecured PHI occurs.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Our responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>We are required by law to maintain the privacy and security of PHI.</li>
              <li>We will notify you promptly if a breach occurs that may have compromised your PHI.</li>
              <li>We must follow the duties and privacy practices described in this Notice.</li>
              <li>We reserve the right to change this Notice. The revised Notice will apply to all PHI we maintain and will be posted on SpryMD.ai/npp with an updated effective date.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Complaints</h2>
            <p>
              If you believe your privacy rights have been violated, you may file a complaint with us
              or with the U.S. Department of Health and Human Services Office for Civil Rights. We
              will not retaliate against you for filing a complaint.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Practice Privacy Officer:</strong>{" "}
                <a href="mailto:privacy@sprymd.ai" className="text-primary underline">privacy@sprymd.ai</a>
              </li>
              <li>
                <strong>HHS OCR:</strong>{" "}
                <a href="https://www.hhs.gov/hipaa/filing-a-complaint/index.html" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                  www.hhs.gov/hipaa/filing-a-complaint
                </a>
              </li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Contact</h2>
            <p>
              William Merrick, DO<br />
              c/o {COMPANY.legalName}<br />
              {COMPANY.addressLine1}<br />
              {COMPANY_CITY_STATE_ZIP}<br />
              Phone: {COMPANY.phone}<br />
              Email: <a href={`mailto:${COMPANY.privacyEmail}`} className="text-primary underline">{COMPANY.privacyEmail}</a>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default NPP;
