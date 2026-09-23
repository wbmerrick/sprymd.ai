import AnimatedSection from "@/components/AnimatedSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <>
    <Navbar />
    <main id="main-content" className="pt-16">
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">Privacy Policy</h1>
    </section>
    <section className="section-padding bg-card">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none">
            <p className="text-lg font-medium text-navy mb-4">Last updated: March 27, 2026</p>

            <p className="font-semibold text-navy">Table of Contents</p>
            <ol className="list-decimal pl-6 space-y-1 mb-8">
              <li>Introduction</li>
              <li>Limitations on Use by Minors</li>
              <li>Protected Information</li>
              <li>Collection of Personal Information</li>
              <li>Use of Personal Information</li>
              <li>Disclosure of Personal Information</li>
              <li>Choice and Control of Personal Information</li>
              <li>Browser or Platform Controls</li>
              <li>Data Retention</li>
              <li>Transactions</li>
              <li>Jurisdictional Issues</li>
              <li>California Privacy Rights</li>
              <li>Miscellaneous</li>
              <li>Contacting Us</li>
            </ol>

            {/* 1. Introduction */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">1. Introduction</h2>
            <p>[INSERT LEGAL ENTITY NAME] and its affiliates (<strong>"SpryMD," "we," "our," or "us"</strong>) owns and operates the website located at SpryMD.ai and any related websites, software, applications, messaging tools, communications channels, content, products, and services (collectively, the <strong>"Service"</strong>). Your access to and use of the Service is subject to this Privacy Policy unless specifically stated otherwise. Capitalized terms not otherwise defined in this Privacy Policy have the same meaning as set forth in the SpryMD Terms and Conditions (<strong>"Terms and Conditions"</strong>).</p>
            <p>We are committed to respecting the privacy of users of the Service. We created this Privacy Policy (<strong>"Privacy Policy"</strong>) to tell you how SpryMD collects, uses, and discloses information in order to provide you with the Service.</p>
            <p>By creating, registering, or logging into an account through the Service, or otherwise accessing or using the Service, you are acknowledging the most recent version of this Privacy Policy. We will update this Privacy Policy when necessary to reflect material changes in the Service or how we use personal information, and as required by applicable law. If we make any changes to our Privacy Policy, we will post the revised Privacy Policy and update the "Last updated" date at the top of the Privacy Policy. If we make material changes to this Privacy Policy, we will provide notice or obtain consent regarding such changes as may be required by law.</p>
            <p>If you are using the Service on behalf of an individual other than yourself, you represent that you are authorized by such an individual to act on such an individual's behalf and that such individual acknowledges the practices and policies outlined in this Privacy Policy.</p>

            {/* 2. Limitations on Use by Minors */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">2. Limitations on Use by Minors</h2>
            <p>The Service is intended for use by individuals who are at least eighteen (18) years of age or such older age as may be required by applicable state laws in the jurisdiction in which an individual utilizes the Service. The Service is not designed or intended to attract, and is not directed to, children under eighteen (18) years of age. If we obtain actual knowledge that we have collected personal information through the Service from a person under eighteen (18) years of age, we will use reasonable efforts to refrain from further using such personal information or maintaining it in retrievable form.</p>

            {/* 3. Protected Information */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">3. Protected Information</h2>
            <p>When you set up an account with SpryMD, you are creating a direct customer relationship with SpryMD that enables you to access and/or utilize the various functions of the Service as a user. As part of that relationship, you provide information to SpryMD, including but not limited to, your name, email address, shipping address, phone number, and certain transactional information, which we do not consider to be "protected health information" or "medical information."</p>
            <p>However, in using certain components of the Service, you may provide certain health or medical information that may be protected under applicable laws. SpryMD is not itself a "covered entity" under the Health Insurance Portability and Accountability Act of 1996 (collectively, <strong>"HIPAA"</strong>). One or more of the Pharmacies, Medical Groups, or Providers (as defined in our Terms and Conditions) may or may not be a "covered entity" or "business associate" under HIPAA, and SpryMD may in some cases be a "business associate" of a Pharmacy or Medical Group.</p>
            <p>To the extent SpryMD is deemed a "business associate," and solely in its role as a business associate, SpryMD may be subject to certain provisions of HIPAA with respect to "protected health information," as defined under HIPAA, that you provide to SpryMD, the Medical Group, or the Providers (<strong>"PHI"</strong>). In addition, any medical or health information that you provide that is subject to specific protections under applicable state laws (collectively, with PHI, <strong>"Protected Information"</strong>), will be used and disclosed only in accordance with such applicable laws. However, any information that does not constitute Protected Information under applicable laws may be used or disclosed in any manner permitted under this Privacy Policy. Protected Information does not include information that has been de-identified in accordance with applicable laws.</p>
            <p>By accessing or using any part of the Service, you understand that any information that you submit to SpryMD that is not intended and used solely for the provision of diagnosis and treatment by the Medical Group and Providers or prescription fulfillment by the Pharmacies, is not considered Protected Information, and will be subject only to our Privacy Policy and any applicable state laws. For purposes of clarity, information you provide to SpryMD in order to register and set up an account, including name, date of birth, email address, shipping address, and phone number, are not considered Protected Information.</p>

            {/* 4. Collection of Personal Information */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">4. Collection of Personal Information</h2>
            <p>The personal information we collect depends on how you interact with us, the services you use, and the choices you make. We collect information about you from different sources and in various ways when you use our services, including information you provide directly, information collected automatically, information from third-party data sources, and data we infer or generate from other data.</p>

            <p className="font-semibold text-navy mt-4">Information you provide directly.</p>
            <p>We collect personal information you provide to us. For example:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Name and contact information</strong>, such as your name, email address, phone number, and billing and physical addresses.</li>
              <li><strong>Demographic data</strong>, such as your gender, date of birth, and zip code.</li>
              <li><strong>Payment information</strong>, such as your credit card number, financial account information, and other payment details.</li>
              <li><strong>Content and files</strong>, such as photographs, documents, and other files you upload to the Service, as well as communications you send to us through messaging platforms.</li>
              <li><strong>Health data</strong>, including information concerning your health, medical history, symptoms, medications, and responses to clinical intake questionnaires.</li>
            </ul>

            <p className="font-semibold text-navy mt-4">Information we collect automatically.</p>
            <p>When you use our services, we collect some information automatically. For example:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Identifiers and device information</strong>. When you visit our website, our web servers automatically log your Internet Protocol (IP) address and information about your device, including device identifiers, device type, operating system, browser type, version, language, settings, and configuration.</li>
              <li><strong>Geolocation data</strong>. Depending on your device settings, we may collect geolocation data when you use our services.</li>
              <li><strong>Usage data</strong>. We automatically log your activity on our website, including the URL of the website from which you came, pages you viewed, how long you spent on a page, access times, and other details about your use of and actions on our website.</li>
            </ul>

            <p className="font-semibold text-navy mt-4">Information we create or generate.</p>
            <p>We infer new information from other data we collect, including using automated means to generate information about your likely preferences or other characteristics (<strong>"inferences"</strong>). For example, we infer your general geographic location (such as city, state, and country) based on your IP address.</p>

            <p className="font-semibold text-navy mt-4">Cookies, Mobile IDs, and Similar Technologies.</p>
            <p>We use cookies, web beacons, mobile analytics and advertising IDs, and similar technologies to operate our website and online services and to help collect data, including usage data, identifiers, and device information.</p>
            <p>Cookies are small text files placed by a website and stored by your browser on your device. A cookie can later be read when your browser connects to a web server in the same domain that placed the cookie. Web beacons are electronic images contained within a website or email that allow web servers to log information about your device and set and read cookies.</p>
            <p>We, and our analytics partners, use these technologies to collect personal information when you use our services, including personal information about your online activities over time and across different websites or online services. This data is used to store your preferences and settings, enable you to sign in, analyze how our website performs, track your interaction with the site, develop inferences, and fulfill other legitimate purposes.</p>

            {/* 5. Use of Personal Information */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">5. Use of Personal Information</h2>
            <p>We use the personal information we collect for purposes described in this Privacy Policy or as otherwise disclosed to you, subject to the limitations addressed in the "Protected Information" section above. For example, we use personal information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Product and service delivery</strong> — To provide and deliver the Service, including troubleshooting, confirming your location, improving, and personalizing those services.</li>
              <li><strong>Business operations</strong> — To operate our business, such as billing, processing your payments, accounting, administering your account, improving our internal operations, securing our systems, detecting fraudulent or illegal activity, verifying your identity, and meeting our legal obligations.</li>
              <li><strong>Product improvement, development, and research</strong> — To develop, test, or improve the Service and content, features, and/or products or services offered via the Service.</li>
              <li><strong>Personalization</strong> — To understand you and your preferences to enhance your experience and enjoyment using our services.</li>
              <li><strong>Customer support</strong> — To provide customer support, fulfill your requests, and respond to your questions.</li>
              <li><strong>Communications</strong> — To send you information including confirmations, invoices, technical notices, updates, security alerts, and support and administrative messages, as well as to facilitate telehealth communications on behalf of your Provider(s).</li>
              <li><strong>Marketing</strong> — To communicate with you about new services, offers, promotions, and other information about our services.</li>
            </ul>
            <p className="mt-4">We combine data we collect from different sources for these purposes and to give you a more seamless, consistent, and personalized experience. We do not use Protected Information for advertising or marketing.</p>
            <p>We may de-identify your information and use, create, and sell such de-identified information for any business or other purpose not prohibited by applicable law.</p>

            {/* 6. Disclosure of Personal Information */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">6. Disclosure of Personal Information</h2>
            <p>We disclose personal information as described below as we determine necessary to complete your transactions or provide the services you have requested or authorized, or with your consent as required by applicable law. For example, we may disclose information about you to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Service providers</strong> — We provide personal information to vendors or agents working on our behalf for the purposes described in this Privacy Policy. For example, companies we've hired to provide customer service support or assist in protecting and securing our systems and services may need access to personal information to provide those functions.</li>
              <li><strong>Financial services & payment processing</strong> — When you provide payment data, we will disclose payment and transactional data to banks and other entities as necessary for payment processing, fraud prevention, credit risk reduction, analytics, or other related financial services.</li>
              <li><strong>Affiliates</strong> — We enable access to personal information across our subsidiaries, affiliates, and related companies, where we share common data systems or where access helps us to provide our services and operate our business.</li>
              <li><strong>Pharmacies, Medical Groups, and Providers</strong> — We facilitate information disclosure between you and the Medical Groups, Pharmacies, and Providers, as applicable, to enable them to provide services to you via the Service and to collect payment on their behalf.</li>
              <li><strong>Corporate transactions</strong> — We may disclose personal information as part of a corporate transaction or proceeding such as a merger, financing, acquisition, bankruptcy, dissolution, or a transfer, divestiture, or sale of all or a portion of our business or assets.</li>
              <li><strong>Legal and law enforcement</strong> — We will access, disclose, and preserve personal information when we believe that doing so is necessary to comply with applicable law or respond to valid legal process, including from law enforcement or other government agencies.</li>
              <li><strong>Security, safety, and protecting rights</strong> — We will disclose personal information if we believe it is necessary to protect our customers and others, operate and maintain the security of our services, or protect the rights or property of ourselves or others.</li>
            </ul>
            <p className="mt-4">Third-party analytics companies may also collect personal information through our website including identifiers and device information, geolocation data, usage data, and inferences based on and associated with that data, as described in the "Cookies" section of this Privacy Policy.</p>

            {/* 7. Choice and Control of Personal Information */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">7. Choice and Control of Personal Information</h2>
            <p>We provide a variety of ways for you to control the personal information we hold about you, including choices about how we use that data. In some jurisdictions, these controls and choices may be enforceable as rights under applicable law.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access, portability, correction, and deletion</strong> — If you wish to access, copy, download, correct, or delete personal information about you that we hold, please contact us using the information provided in the "Contacting Us" section below.</li>
              <li><strong>Targeted advertising opt-out</strong> — If you wish to opt-out of the use of your personal information for targeted advertising, you may contact us or use the opt-out controls offered by the NAI (<a href="http://optout.networkadvertising.org" className="text-primary underline">http://optout.networkadvertising.org</a>) or the DAA (<a href="http://optout.aboutads.info/" className="text-primary underline">http://optout.aboutads.info/</a>).</li>
              <li><strong>Communications preferences</strong> — You can choose whether to receive promotional communications from us by email or SMS. If you receive promotional messages from us and would like to stop, you can do so by following the directions in that message or by contacting us. These choices do not apply to mandatory service communications.</li>
            </ul>

            {/* 8. Browser or Platform Controls */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">8. Browser or Platform Controls</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Cookie controls</strong> — Most web browsers are set to accept cookies by default. You can go to your browser settings to learn how to delete or reject cookies. If you choose to delete or reject cookies, this could affect certain features or services of our website.</li>
              <li><strong>Global Privacy Control</strong> — Some browsers and browser extensions support the "Global Privacy Control" (GPC) or similar controls that can send a signal to the websites you visit indicating your choice to opt-out from certain types of data processing, including data sales and/or targeted advertising. When we detect such a signal, we will make reasonable efforts to respect your choices.</li>
              <li><strong>Do Not Track</strong> — There is not a common understanding of how to interpret the DNT signal; therefore, our website does not respond to browser DNT signals. Instead, you can use other tools to control data collection and use, including the GPC, cookie controls, and advertising controls described above.</li>
            </ul>

            {/* 9. Data Retention */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">9. Data Retention</h2>
            <p>We retain personal information for as long as necessary to provide the services and fulfill the transactions you have requested, comply with our legal obligations, resolve disputes, enforce our agreements, and for other legitimate and lawful business purposes. Actual retention periods can vary significantly based on criteria such as user expectations or consent, the sensitivity of the information, the availability of automated controls that enable users to delete data, and our legal or contractual obligations.</p>

            {/* 10. Transactions */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">10. Transactions</h2>
            <p>In connection with any transaction that you conduct through the Service (e.g., the purchase of any products or services on or through the Service), you may be asked to supply certain information relevant to the transaction, including, without limitation, your credit card number and expiration date, your billing address, your shipping address, your phone number, and/or your email address. By submitting such information, you grant SpryMD the irrevocable, unencumbered, universe-wide, and perpetual right to provide such information to third parties (e.g., payment processing companies) for the purpose of facilitating the transaction.</p>
            <p>All credit card, debit card, and other monetary transactions on or through the Service occur through an online payment processing application provided by Stripe (<strong>"Stripe"</strong>). Additional information about Stripe, its privacy policy, and information security measures should be available on the Stripe website located at <a href="https://stripe.com/us/privacy" className="text-primary underline">https://stripe.com/us/privacy</a> or by contacting Stripe directly. SpryMD's relationship with Stripe is merely contractual in nature, as Stripe is a third-party vendor to SpryMD.</p>

            {/* 11. Jurisdictional Issues */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">11. Jurisdictional Issues</h2>
            <p>The Service may only be used within certain states within the United States as described in our Terms and Conditions. Accordingly, this Privacy Policy, and our collection, use, and disclosure of information about you, is governed by U.S. law.</p>

            {/* 12. California Privacy Rights */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">12. California Privacy Rights</h2>
            <p>If you are a California resident and the processing of personal information about you is subject to the California Consumer Privacy Act (CCPA), you have certain rights with respect to that information.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Notice at Collection</strong> — At or before the time of collection, you have a right to receive notice of our practices, including the categories of personal information and sensitive personal information to be collected, the purposes for which such information is collected or used, whether such information is sold or shared, and how long such information is retained.</li>
              <li><strong>Right to Know</strong> — You have a right to request that we disclose to you the personal information we have collected about you. You also have a right to request additional information about our collection, use, disclosure, or sale of such personal information.</li>
              <li><strong>Rights to Request Correction or Deletion</strong> — You have rights to request that we correct inaccurate personal information and that we delete personal information under certain circumstances, subject to a number of exceptions.</li>
              <li><strong>Right to Opt-Out / "Do Not Sell or Share My Personal Information"</strong> — You have a right to opt-out from future "sales" or "sharing" of personal information as those terms are defined by the CCPA.</li>
              <li><strong>Right to Limit Use and Disclosure of Sensitive Personal Information</strong> — You have a right to limit our use of sensitive personal information for any purposes other than to provide the services or goods you request or as otherwise permitted by law.</li>
            </ul>
            <p className="mt-4">You may designate, in writing or through a power of attorney, an authorized agent to make requests on your behalf to exercise your rights under the CCPA. Before accepting such a request from an agent, we will require the agent to provide proof you have authorized it to act on your behalf, and we may need you to verify your identity directly with us.</p>
            <p>You have a right to not be discriminated against for exercising these rights set out in the CCPA.</p>
            <p>Additionally, under California Civil Code section 1798.83 (the "Shine the Light" law), California residents who have provided personal information to a business may request information about whether the business has disclosed personal information to any third parties for the third parties' direct marketing purposes. Please be aware that we do not disclose personal information to any third parties for their direct marketing purposes as defined by this law.</p>

            {/* 13. Miscellaneous */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">13. Miscellaneous</h2>
            <p>We strive to use reasonable physical, technical, and administrative measures to protect information from unauthorized access, use, disclosure, alteration, and destruction. However, you must keep your account password secure and your account confidential, and you are responsible for any and all use of your account. To help us protect personal information, we request that you use a strong password and never share your password with anyone or use the same password with other sites or accounts. If you have reason to believe that the security of your account has been compromised, please notify us immediately in accordance with the "Contacting Us" section below.</p>
            <p>When using the Service, you may choose not to provide us with certain information, but this may limit the features you are able to use or may prevent you from using the Service altogether. SpryMD may supplement, amend, or otherwise modify this Privacy Policy at any time. Such supplements, amendments, and other modifications will be posted on this or a similar page of the Service, and shall be deemed effective as of the "Last Updated" date.</p>

            {/* 14. Contacting Us */}
            <h2 className="text-xl font-bold text-navy mt-8 mb-3">14. Contacting Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us by email at <a href="mailto:privacy@sprymd.ai" className="text-primary underline">privacy@sprymd.ai</a> or by regular mail at:</p>
            <p className="mt-2">
              [INSERT LEGAL ENTITY NAME]<br />
              [ADDRESS LINE 1]<br />
              [CITY, STATE, ZIP]<br />
              Attn: Privacy Officer
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
    </main>
    <Footer />
  </>
);

export default Privacy;
