import AnimatedSection from "@/components/AnimatedSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <>
    <Navbar />
    <main id="main-content" className="pt-16">
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">Terms and Conditions</h1>
    </section>
    <section className="section-padding bg-card">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none">
            <p className="text-lg font-medium text-navy mb-4">Last updated: September 25, 2026</p>
            <p className="text-xs text-muted-foreground mb-4">Draft for counsel review before treating as final.</p>

            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 text-sm font-medium text-navy">
              <p className="mb-3">BY CLICKING "I AGREE," CHECKING A RELATED BOX TO SIGNIFY YOUR ACCEPTANCE, USING ANY OTHER ACCEPTANCE PROTOCOL PRESENTED THROUGH THE SERVICE (AS DEFINED BELOW), OR OTHERWISE AFFIRMATIVELY ACCEPTING THESE TERMS AND CONDITIONS, YOU ACKNOWLEDGE THAT YOU HAVE READ, ACCEPTED, AND AGREED TO BE BOUND BY THIS AGREEMENT. IF YOU DO NOT AGREE TO THESE TERMS AND CONDITIONS, DO NOT CREATE AN ACCOUNT OR USE THE SERVICE.</p>
              <p className="mb-3"><strong>DISPUTE RESOLUTION:</strong> UNLESS YOU TIMELY OPT OUT OF ARBITRATION IN ACCORDANCE WITH THESE TERMS AND CONDITIONS, YOU AND WE AGREE THAT MOST DISPUTES BETWEEN YOU AND US, THE MEDICAL GROUPS, OR PROVIDERS ARISING OUT OF OR RELATED TO THESE TERMS AND CONDITIONS OR THE SERVICE WILL BE RESOLVED BY BINDING INDIVIDUAL ARBITRATION AND NOT IN COURT. THIS MEANS YOU WAIVE THE RIGHT TO A JURY TRIAL AND THE RIGHT TO PARTICIPATE IN A CLASS ACTION OR CLASS-WIDE ARBITRATION, SUBJECT TO THE LIMITED EXCEPTIONS BELOW.</p>
              <p><strong>MEDICAL EMERGENCY NOTICE:</strong> IF YOU HAVE A MEDICAL EMERGENCY, SEEK IN-PERSON EMERGENCY CARE IMMEDIATELY OR DIAL 911. THE SERVICE IS NOT APPROPRIATE FOR EMERGENCIES. THE SERVICE IS LIMITED TO THE TELEHEALTH EVALUATION AND TREATMENT OF CONDITIONS AND PROTOCOLS EXPRESSLY MADE AVAILABLE THROUGH THE PLATFORM (INCLUDING, WITHOUT LIMITATION, ERECTILE DYSFUNCTION, WEIGHT MANAGEMENT, HAIR LOSS, SKIN CARE, CERTAIN PEPTIDE AND NAD+ PROTOCOLS, AND PRIMARY-CARE STYLE VISITS WHERE OFFERED). THE SERVICE IS NOT A SUBSTITUTE FOR EMERGENCY CARE OR FOR COMPREHENSIVE IN-PERSON SPECIALTY CARE WHEN A PROVIDER DETERMINES THAT TELEHEALTH IS NOT APPROPRIATE.</p>
            </div>

            <p>These Terms and Conditions ("Terms," "Terms and Conditions," or "Agreement") govern your access to and use of the website located at SpryMD.ai, any related websites, software, applications, messaging tools, communications channels, content, products, and services made available by SpryMD Inc., SpryMD Telehealth Tennessee P.C., and their affiliates (collectively, "SpryMD," "we," "our," or "us") (collectively, the "Service").</p>

            <p>Please read this Agreement carefully. In this Agreement, the terms "you" and "your" mean the individual using the Service. The Service is intended only for adults age eighteen (18) or older, or the age of majority in the user's jurisdiction if greater. The Service is not intended for minors.</p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>Your access to and use of the Service is subject to this Agreement and all applicable laws and regulations. If you do not accept and agree to be bound by this Agreement in its entirety, you may not access or use the Service except as necessary to review these Terms.</p>
            <p>We may revise this Agreement from time to time in our sole discretion. Any changes are effective when posted to the Service unless otherwise stated. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Agreement.</p>

            <h2 className="text-xl font-bold text-navy mt-8 mb-3">2. Your Relationship With Us</h2>
            <p>SpryMD operates a technology platform that enables users to access certain administrative, support, communications, payment, and coordination services in connection with telehealth services for the care categories made available on the platform (for example: erectile dysfunction, weight management, hair loss, skin care, sermorelin and NAD+ protocols, and primary-care style visits where offered). Availability of any specific protocol may change and is always subject to clinician judgment and applicable law.</p>
            <p>SpryMD is not itself a medical provider, pharmacy, or laboratory unless expressly identified otherwise in writing. Healthcare services made available through the Service are provided by independent licensed medical groups and/or healthcare professionals (collectively, the "Medical Groups" and "Providers"). Prescription fulfillment services are provided by licensed pharmacies (the "Pharmacies"). Laboratory services, if any are ever offered through the Service, are provided by independent laboratories (the "Labs").</p>
            <p>By using the Service, you understand and agree that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>SpryMD does not practice medicine and does not direct or control the clinical judgment of any Medical Group or Provider.</li>
              <li>Any diagnosis, treatment decision, prescription, refill, denial of treatment, referral, or recommendation is made solely by the applicable Provider or Medical Group.</li>
              <li>Any dispensing, shipping, compounding, substitution, transfer, or fulfillment of medications is handled by the applicable Pharmacy, subject to law.</li>
              <li>You may establish a provider-patient relationship with a Medical Group and/or Provider through the Service, but not with SpryMD solely by using the platform.</li>
            </ul>
            <p className="mt-4">By accepting this Agreement, you acknowledge that Medical Groups, Providers, Pharmacies, and Labs made available through the Service may be third-party beneficiaries of this Agreement to the extent applicable to the services they provide.</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
    </main>
    <Footer />
  </>
);

export default Terms;
