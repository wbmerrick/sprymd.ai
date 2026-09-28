import AnimatedSection from "@/components/AnimatedSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * HIPAA Notice of Privacy Practices for SpryMD telehealth.
 * Privacy Officer contact aligns with the site footer (privacy@sprymd.ai).
 * Have counsel review before relying on this as the operative NPP.
 */
const NPP = () => (
  <>
    <Navbar />
    <main id="main-content" className="pt-16">
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">
        Notice of Privacy Practices
      </h1>
    </section>

    <section className="section-padding bg-card py-12 md:py-16">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none">
            <p className="text-lg font-medium text-navy mb-4">Effective Date: September 24, 2026</p>
            <p>
              This Notice of Privacy Practices (<strong>"Notice"</strong>) describes how medical
              information about you may be used and disclosed and how you can get access to this
              information. Please review it carefully.
            </p>
            <p>
              SpryMD Inc. and affiliated clinical entities that deliver telehealth through SpryMD.ai
              (collectively, <strong>"SpryMD," "we," "us,"</strong> or <strong>"our"</strong>)
              create and maintain protected health information (<strong>"PHI"</strong>) when you
              receive care. This Notice applies to PHI we maintain in connection with telehealth
              visits, clinical intake, prescribing, and related care coordination for patients
              physically located in licensed states (currently Tennessee).
            </p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-3">Our responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We are required by law to maintain the privacy and security of your PHI.</li>
              <li>We must provide you with this Notice of our legal duties and privacy practices.</li>
              <li>We must follow the terms of the Notice that is currently in effect.</li>
              <li>
                We will notify you promptly if a breach occurs that may have compromised the privacy
                or security of your PHI, as required by law.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8 mb-3">How we may use and disclose PHI</h2>
            <p className="font-semibold text-navy mt-4">Treatment</p>
            <p>
              We may use and share your PHI to provide, coordinate, or manage your care — for
              example, clinician review of your intake, video or messaging visits, prescribing, and
              coordination with pharmacies or laboratories involved in your care.
            </p>
            <p className="font-semibold text-navy mt-4">Payment</p>
            <p>
              We may use and share PHI to obtain payment for services, including cash-pay checkout,
              claim processing if applicable, and billing support with payment processors that
              handle card transactions (payment card data is processed by our payment provider and
              is not stored as clinical chart text).
            </p>
            <p className="font-semibold text-navy mt-4">Health care operations</p>
            <p>
              We may use and share PHI for quality improvement, clinician training, audit,
              compliance, customer support related to your visit, and operating secure telehealth
              systems (including video vendors under a Business Associate Agreement when required).
            </p>
            <p className="font-semibold text-navy mt-4">As required or permitted by law</p>
            <p>
              We may disclose PHI when required by law, for public health activities, health
              oversight, judicial or administrative proceedings, law enforcement in limited
              circumstances, to avert a serious threat to health or safety, and for other purposes
              permitted or required under HIPAA and applicable Tennessee law.
            </p>
            <p className="font-semibold text-navy mt-4">With your authorization</p>
            <p>
              Other uses and disclosures not described in this Notice will be made only with your
              written authorization. You may revoke an authorization in writing at any time, except
              to the extent we have already relied on it.
            </p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-3">Your rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access.</strong> You may ask to see or get an electronic or paper copy of
                your medical record and other PHI we maintain about you.
              </li>
              <li>
                <strong>Amend.</strong> You may ask us to correct PHI you believe is incorrect or
                incomplete.
              </li>
              <li>
                <strong>Accounting of disclosures.</strong> You may ask for a list of certain
                disclosures we made of your PHI.
              </li>
              <li>
                <strong>Request restrictions.</strong> You may ask us to limit how we use or share
                PHI for treatment, payment, or operations. We are not required to agree in every
                case.
              </li>
              <li>
                <strong>Confidential communications.</strong> You may ask us to contact you in a
                specific way (for example, a particular email or phone number).
              </li>
              <li>
                <strong>Paper copy of this Notice.</strong> You may ask for a paper copy of this
                Notice at any time, even if you agreed to receive it electronically.
              </li>
              <li>
                <strong>Choose someone to act for you.</strong> If you have given someone medical
                power of attorney or if someone is your legal guardian, that person may exercise
                your rights and make choices about your PHI.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-navy mt-8 mb-3">Complaints</h2>
            <p>
              If you believe your privacy rights have been violated, you may file a complaint with
              us or with the U.S. Department of Health and Human Services Office for Civil Rights.
              We will not retaliate against you for filing a complaint.
            </p>
            <p className="mt-2">
              HHS OCR complaint portal:{" "}
              <a
                href="https://www.hhs.gov/hipaa/filing-a-complaint/index.html"
                className="text-navy underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                hhs.gov/hipaa/filing-a-complaint
              </a>
            </p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-3">Privacy Officer contact</h2>
            <p>
              SpryMD Inc.
              <br />
              Attn: Privacy Officer
              <br />
              Email:{" "}
              <a href="mailto:privacy@sprymd.ai" className="text-navy underline underline-offset-2">
                privacy@sprymd.ai
              </a>
              <br />
              Website:{" "}
              <a href="https://www.sprymd.ai" className="text-navy underline underline-offset-2">
                www.sprymd.ai
              </a>
            </p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-3">Changes to this Notice</h2>
            <p>
              We may change the terms of this Notice at any time. The new Notice will be effective
              for all PHI we maintain at that time. The current Notice will be posted on SpryMD.ai
              with the effective date above.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
    </main>
    <Footer />
  </>
);

export default NPP;
