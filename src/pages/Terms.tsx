// NOTE: This document is a working draft. Attorney review is required before launch.
import AnimatedSection from "@/components/AnimatedSection";

import { COMPANY, COMPANY_CITY_STATE_ZIP } from "@/lib/company";

const Terms = () => (
  <main>
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">Terms and Conditions</h1>
    </section>
    <section className="section-padding bg-card">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none">
            <p className="text-lg font-medium text-foreground mb-4">Last updated: March 27, 2026</p>

            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 text-sm font-medium text-foreground">
              <p className="mb-3">BY CLICKING "I AGREE," CHECKING A RELATED BOX TO SIGNIFY YOUR ACCEPTANCE, USING ANY OTHER ACCEPTANCE PROTOCOL PRESENTED THROUGH THE SERVICE (AS DEFINED BELOW), OR OTHERWISE AFFIRMATIVELY ACCEPTING THESE TERMS AND CONDITIONS, YOU ACKNOWLEDGE THAT YOU HAVE READ, ACCEPTED, AND AGREED TO BE BOUND BY THIS AGREEMENT. IF YOU DO NOT AGREE TO THESE TERMS AND CONDITIONS, DO NOT CREATE AN ACCOUNT OR USE THE SERVICE.</p>
              <p className="mb-3"><strong>DISPUTE RESOLUTION:</strong> UNLESS YOU TIMELY OPT OUT OF ARBITRATION IN ACCORDANCE WITH THESE TERMS AND CONDITIONS, YOU AND WE AGREE THAT MOST DISPUTES BETWEEN YOU AND US, THE MEDICAL GROUPS, OR PROVIDERS ARISING OUT OF OR RELATED TO THESE TERMS AND CONDITIONS OR THE SERVICE WILL BE RESOLVED BY BINDING INDIVIDUAL ARBITRATION AND NOT IN COURT. THIS MEANS YOU WAIVE THE RIGHT TO A JURY TRIAL AND THE RIGHT TO PARTICIPATE IN A CLASS ACTION OR CLASS-WIDE ARBITRATION, SUBJECT TO THE LIMITED EXCEPTIONS BELOW.</p>
              <p><strong>MEDICAL EMERGENCY NOTICE:</strong> IF YOU HAVE A MEDICAL EMERGENCY, SEEK IN-PERSON EMERGENCY CARE IMMEDIATELY OR DIAL 911. THE SERVICE IS NOT APPROPRIATE FOR EMERGENCIES. THE SERVICE IS LIMITED TO THE EVALUATION AND TREATMENT OF ERECTILE DYSFUNCTION ("ED") AND RELATED MATTERS EXPRESSLY MADE AVAILABLE THROUGH THE PLATFORM. THE SERVICE IS NOT PRIMARY CARE AND IS NOT A SUBSTITUTE FOR AN IN-PERSON PHYSICIAN OR FOR COMPREHENSIVE UROLOGIC, CARDIAC, ENDOCRINE, OR GENERAL MEDICAL CARE.</p>
            </div>

            <p>These Terms and Conditions ("Terms," "Terms and Conditions," or "Agreement") govern your access to and use of the website located at SpryMD.ai, any related websites, software, applications, messaging tools, communications channels, content, products, and services made available by {COMPANY.legalName} and its affiliates (collectively, "SpryMD," "we," "our," or "us") (collectively, the "Service").</p>

            <p>Please read this Agreement carefully. In this Agreement, the terms "you" and "your" mean the individual using the Service. The Service is intended only for adults age eighteen (18) or older, or the age of majority in the user's jurisdiction if greater. The Service is not intended for minors.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>Your access to and use of the Service is subject to this Agreement and all applicable laws and regulations. If you do not accept and agree to be bound by this Agreement in its entirety, you may not access or use the Service except as necessary to review these Terms.</p>
            <p>We may revise this Agreement from time to time in our sole discretion. Any changes are effective when posted to the Service unless otherwise stated. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Agreement.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">2. Your Relationship With Us</h2>
            <p>SpryMD operates a technology platform that enables users to access certain administrative, support, communications, payment, and coordination services in connection with telehealth services related to erectile dysfunction.</p>
            <p>SpryMD is not itself a medical provider, pharmacy, or laboratory unless expressly identified otherwise in writing. Healthcare services made available through the Service are provided by independent licensed medical groups and/or healthcare professionals (collectively, the "Medical Groups" and "Providers"). Prescription fulfillment services are provided by licensed pharmacies (the "Pharmacies"). Laboratory services, if any are ever offered through the Service, are provided by independent laboratories (the "Labs").</p>
            <p>By using the Service, you understand and agree that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>SpryMD does not practice medicine and does not direct or control the clinical judgment of any Medical Group or Provider.</li>
              <li>Any diagnosis, treatment decision, prescription, refill, denial of treatment, referral, or recommendation is made solely by the applicable Provider or Medical Group.</li>
              <li>Any dispensing, shipping, compounding, substitution, transfer, or fulfillment of medications is handled by the applicable Pharmacy, subject to law.</li>
              <li>You may establish a provider-patient relationship with a Medical Group and/or Provider through the Service, but not with SpryMD solely by using the platform.</li>
            </ul>
            <p className="mt-4">By accepting this Agreement, you acknowledge that Medical Groups, Providers, Pharmacies, and Labs made available through the Service may be third-party beneficiaries of this Agreement to the extent applicable to the services they provide.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">3. Eligibility</h2>
            <p>To use the Service, you represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>You are at least eighteen (18) years of age (or the age of majority in your jurisdiction, if greater).</li>
              <li>You are physically located in the State of Tennessee at the time you complete a clinical intake and at the time any telehealth service is provided to you. Providers are licensed in Tennessee, and the clinical services offered through the Service are available only to individuals located in Tennessee.</li>
              <li>All information you provide — including your identity, contact information, and health history — is accurate, current, and complete, and you will keep it up to date. Providing false or incomplete health information can result in serious harm to you and may result in immediate termination of your access to the Service without refund.</li>
              <li>You are using the Service for yourself and not on behalf of another person.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">4. Telehealth Services; Not for Emergencies</h2>
            <p>The clinical services made available through the Service are provided via asynchronous ("store-and-forward") telehealth. You complete a structured health intake questionnaire, and a licensed Provider reviews your responses and, where clinically appropriate, issues a diagnosis and treatment plan. There are no scheduled appointments and no video visits. A Provider may follow up with you by secure message if additional information is needed before making a clinical decision.</p>
            <p>Telehealth involves inherent limitations, including the absence of an in-person physical examination. By using the Service, you acknowledge these limitations and consent to receiving care via asynchronous telehealth. Your Provider may determine that telehealth is not appropriate for your condition and may direct you to in-person care.</p>
            <p className="font-semibold text-foreground">THE SERVICE IS NOT FOR EMERGENCIES. IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY — INCLUDING BUT NOT LIMITED TO CHEST PAIN, DIFFICULTY BREATHING, SUDDEN VISION OR HEARING LOSS, OR AN ERECTION LASTING MORE THAN FOUR (4) HOURS — CALL 911 OR GO TO THE NEAREST EMERGENCY ROOM IMMEDIATELY. DO NOT USE THE SERVICE TO SEEK EMERGENCY CARE, AND DO NOT DELAY SEEKING EMERGENCY CARE BECAUSE OF INFORMATION OR COMMUNICATIONS RECEIVED THROUGH THE SERVICE.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">5. Subscription and Billing</h2>
            <p>Access to the Service is offered as a monthly subscription at a price of seventy-five dollars ($75.00) per month, unless otherwise stated at the time of purchase. By subscribing, you authorize us (and our payment processor) to charge your payment method the subscription fee on a recurring monthly basis until you cancel. <strong>Your subscription automatically renews each month.</strong></p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Cancellation.</strong> You may cancel at any time through your patient portal or by contacting us at <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a>. Cancellation takes effect at the end of your current billing period. There is no cancellation fee.</li>
              <li><strong>Payment processing.</strong> All payments are processed by Stripe, a third-party payment processor. Your use of Stripe's services is subject to Stripe's terms and privacy policy. We do not store your full payment card number.</li>
              <li><strong>Billing descriptor.</strong> Charges will appear on your payment statement under a discreet descriptor such as "{COMPANY.billingDescriptor}." The descriptor does not reference ED, medications, or men's health.</li>
              <li><strong>Price changes.</strong> We may change subscription pricing with advance notice; changes take effect at your next renewal after notice.</li>
              <li><strong>Failed payments.</strong> If a recurring charge fails, we may retry the charge and/or suspend the Service until payment is completed.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">6. Refunds</h2>
            <p>If, after reviewing your intake, the Provider determines that you are not a candidate for treatment through the Service, you will receive a <strong>full refund</strong> of your payment for that consultation.</p>
            <p>Except as described above or as required by law, payments are <strong>non-refundable once a Provider has begun reviewing your case</strong>, because clinical time has been expended on your behalf. This applies regardless of whether a prescription is ultimately issued (see Section 7). Refund requests may be submitted to <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a> and will be evaluated in accordance with this Section and applicable law.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">7. Prescriptions</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Clinician discretion.</strong> Whether to issue a prescription, and which medication and dose to prescribe, is determined solely by the treating Provider in the exercise of independent professional judgment.</li>
              <li><strong>Payment is not a guarantee of a prescription.</strong> Paying for a consultation entitles you to a clinical review, not to a particular outcome. If treatment is not clinically appropriate for you, no prescription will be issued (and the refund terms in Section 6 apply where you are determined not to be a candidate).</li>
              <li><strong>No controlled substances.</strong> No controlled substances are prescribed through the Service under any circumstances.</li>
              <li><strong>Pharmacy choice.</strong> Prescriptions may be routed to a partner Pharmacy for fulfillment, but you always have the right to request that your prescription be sent to a pharmacy of your choosing.</li>
              <li><strong>Use as directed.</strong> You agree to take medications only as directed by your Provider and to report side effects and changes in your health promptly.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">8. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide false, misleading, or incomplete information, including health information, or impersonate any person.</li>
              <li>Use the Service on behalf of anyone other than yourself, or share, resell, or transfer medications obtained through the Service.</li>
              <li>Access or attempt to access another user's account, or probe, scan, or test the vulnerability of the Service or circumvent any security measures.</li>
              <li>Use any robot, scraper, or other automated means to access the Service, or copy, frame, or mirror any part of the Service.</li>
              <li>Interfere with or disrupt the Service, servers, or networks, or introduce viruses or other harmful code.</li>
              <li>Use the Service in violation of any applicable law or regulation, or for any unlawful, fraudulent, or abusive purpose.</li>
              <li>Harass, abuse, or harm Providers, staff, or other users.</li>
            </ul>
            <p className="mt-2">We may suspend or terminate your access to the Service for violation of this Section or any other provision of this Agreement.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">9. Intellectual Property</h2>
            <p>The Service, including all software, text, graphics, logos, trademarks, service marks, page layouts, and other content (excluding your personal information and medical records), is owned by SpryMD or its licensors and is protected by intellectual property laws. We grant you a limited, revocable, non-exclusive, non-transferable license to access and use the Service for your personal, non-commercial use in accordance with this Agreement. No other rights are granted. You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit any portion of the Service without our prior written consent. All feedback and suggestions you provide regarding the Service may be used by us without restriction or compensation to you.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">10. Disclaimers</h2>
            <p>EXCEPT AS EXPRESSLY PROVIDED IN THIS AGREEMENT AND TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
            <p>SPRYMD DOES NOT PRACTICE MEDICINE AND MAKES NO REPRESENTATION OR WARRANTY REGARDING ANY DIAGNOSIS, TREATMENT, PRESCRIPTION, OR OTHER CLINICAL SERVICE PROVIDED BY ANY MEDICAL GROUP, PROVIDER, PHARMACY, OR LAB. NOTHING IN THIS SECTION LIMITS ANY PROVIDER'S PROFESSIONAL OBLIGATIONS TO YOU UNDER APPLICABLE LAW.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">11. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL SPRYMD OR ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO THIS AGREEMENT OR THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL AGGREGATE LIABILITY OF SPRYMD ARISING OUT OF OR RELATED TO THIS AGREEMENT OR THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO SPRYMD FOR THE SERVICE DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).</p>
            <p>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU. NOTHING IN THIS AGREEMENT LIMITS OR EXCLUDES LIABILITY THAT CANNOT BE LIMITED OR EXCLUDED UNDER APPLICABLE LAW, INCLUDING LIABILITY FOR GROSS NEGLIGENCE, WILLFUL MISCONDUCT, OR STATUTORY RIGHTS THAT CANNOT BE WAIVED. THIS SECTION DOES NOT APPLY TO PROFESSIONAL LIABILITY CLAIMS AGAINST A PROVIDER OR MEDICAL GROUP TO THE EXTENT SUCH LIMITATION IS PROHIBITED BY LAW.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">12. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless SpryMD and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your violation of this Agreement; (b) your violation of any applicable law or the rights of any third party; (c) inaccurate, incomplete, or false information you provide, including health information; or (d) your misuse of the Service or of any medication obtained through the Service. This obligation survives termination of this Agreement.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">13. Dispute Resolution; Binding Arbitration; Class Action Waiver</h2>
            <p className="font-semibold text-foreground">PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT. THIS IS THE ARBITRATION PROVISION REFERENCED IN THE DISPUTE RESOLUTION NOTICE AT THE TOP OF THESE TERMS.</p>
            <p><strong>Agreement to arbitrate.</strong> Except as set out below, you and SpryMD agree that any dispute, claim, or controversy arising out of or relating to this Agreement or the Service — including disputes involving the Medical Groups, Providers, Pharmacies, or Labs to the extent they relate to the Service — will be resolved by binding individual arbitration administered by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules then in effect. The Federal Arbitration Act governs the interpretation and enforcement of this Section. Judgment on the arbitration award may be entered in any court of competent jurisdiction.</p>
            <p><strong>Exceptions.</strong> Notwithstanding the foregoing: (a) either party may bring an individual claim in small claims court if the claim qualifies; and (b) either party may seek injunctive or other equitable relief in a court of competent jurisdiction to protect its intellectual property rights.</p>
            <p><strong>Class action waiver.</strong> YOU AND SPRYMD EACH AGREE THAT DISPUTES WILL BE RESOLVED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION OR CLASS-WIDE ARBITRATION. IF THIS CLASS ACTION WAIVER IS FOUND UNENFORCEABLE AS TO A PARTICULAR CLAIM, THEN THAT CLAIM (AND ONLY THAT CLAIM) MUST PROCEED IN COURT.</p>
            <p><strong>30-day right to opt out.</strong> You may opt out of this arbitration agreement by sending written notice to <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a> (or the mailing address in Section 17) within thirty (30) days of the date you first accept these Terms. Your notice must include your name, email address associated with your account, and a clear statement that you wish to opt out of arbitration. Opting out of arbitration does not affect any other provision of this Agreement.</p>
            <p><strong>Fees.</strong> Payment of AAA filing, administration, and arbitrator fees will be governed by the AAA Consumer Arbitration Rules.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">14. Governing Law</h2>
            <p>This Agreement and any dispute arising out of or related to it or the Service are governed by the laws of the State of Tennessee, without regard to its conflict-of-laws principles, except that the Federal Arbitration Act governs Section 13. Subject to Section 13, any judicial proceeding permitted under this Agreement must be brought exclusively in the state or federal courts located in Tennessee, and you consent to the jurisdiction of those courts.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">15. Changes to These Terms</h2>
            <p>We may modify this Agreement from time to time. If we make material changes, we will provide notice as required by applicable law, such as by posting the updated Terms on the Service and updating the "Last updated" date, and, where appropriate, by emailing you. Changes are effective when posted unless otherwise stated. Your continued use of the Service after changes take effect constitutes acceptance of the revised Agreement. If you do not agree to the revised Agreement, you must stop using the Service and may cancel your subscription.</p>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">16. Miscellaneous</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Entire agreement.</strong> This Agreement, together with the Privacy Policy and any consents you provide through the Service, constitutes the entire agreement between you and SpryMD regarding the Service.</li>
              <li><strong>Severability.</strong> If any provision of this Agreement is held invalid or unenforceable, the remaining provisions remain in full force and effect.</li>
              <li><strong>No waiver.</strong> Our failure to enforce any right or provision is not a waiver of that right or provision.</li>
              <li><strong>Assignment.</strong> You may not assign or transfer this Agreement without our prior written consent. We may assign this Agreement without restriction.</li>
              <li><strong>Survival.</strong> Provisions that by their nature should survive termination (including Sections 9–14) survive termination of this Agreement.</li>
              <li><strong>Force majeure.</strong> We are not liable for any delay or failure to perform resulting from causes outside our reasonable control.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">17. Contact</h2>
            <p>Questions about these Terms may be directed to:</p>
            <p className="mt-2">
              {COMPANY.legalName}<br />
              {COMPANY.addressLine1}<br />
              {COMPANY_CITY_STATE_ZIP}<br />
              Email: <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default Terms;
