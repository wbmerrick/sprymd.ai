import { Link } from "react-router-dom";

import { ClipboardList, Stethoscope, Package, Check, ChevronDown, HeartPulse, Scale, Activity } from "lucide-react";

import AnimatedSection from "@/components/AnimatedSection";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";



const HeroSection = () =>

  <section className="relative min-h-[90vh] flex items-center bg-canvas overflow-hidden pt-16">

    <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-navy" />

    <div className="absolute bottom-[38%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent" />

    <div className="absolute top-20 right-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />

    <div className="absolute top-40 left-10 w-48 h-48 rounded-full bg-teal/8 blur-3xl" />



    <div className="relative z-10 w-full px-4 py-20 max-w-4xl mx-auto text-center">

      <AnimatedSection>

        <p className="section-label mb-6 tracking-[0.25em]">DISCREET · FAST · PHYSICIAN-REVIEWED</p>

      </AnimatedSection>

      <AnimatedSection delay={0.1}>

        <h1 className="text-navy text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-8 font-display">

          Become Spry —{" "}

          <span className="text-primary">Physician-Led Care</span>{" "}

          That Meets You Where You Are

        </h1>

      </AnimatedSection>

      <AnimatedSection delay={0.2}>

        <p className="font-body text-muted-foreground text-lg md:text-xl max-w-[560px] mx-auto mb-10">

          Answer a few questions. A board-certified physician reviews your case. FDA-approved medication shipped discreetly to your door — no office visit required.

        </p>

      </AnimatedSection>

      <AnimatedSection delay={0.3}>

        <Link to="/quiz" className="btn-primary-lg">

          Start My Free Consultation →

        </Link>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-8">

          <span className="status-pill status-success">

            <span className="status-dot-success" /> HIPAA-Secure

          </span>

          <span className="status-pill status-success">

            <span className="status-dot-success" /> Licensed Physician

          </span>

          <span className="font-body text-sm text-primary-foreground/80 hidden sm:inline">·</span>

          <span className="font-body text-sm text-primary-foreground/80">Discreet Shipping · Cancel Anytime</span>

        </div>

      </AnimatedSection>

    </div>

  </section>;





const TrustBar = () =>

  <section className="bg-card border-y border-gray-light py-6 px-4 -mt-1 relative z-20 shadow-sm">

    <div className="section-container flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">

      {["Board-Certified Physician", "FDA-Approved Medications", "Shipped Discreetly to Your Door"].map((item, i) =>

        <div key={i} className="flex items-center gap-2">

          <Check className="text-teal w-5 h-5 flex-shrink-0" />

          <span className="font-body text-foreground font-medium text-sm">{item}</span>

          {i < 2 && <span className="hidden md:block ml-6 w-px h-5 bg-gray-light" />}

        </div>

      )}

    </div>

  </section>;





const Services = () => {

  const services = [

    {

      icon: HeartPulse,

      title: "ED Treatment",

      body: "FDA-approved PDE5 inhibitors prescribed by a board-certified physician. Discreet, fast, and clinically appropriate.",

      accent: "coral" as const,

      cta: "Explore ED Care",

    },

    {

      icon: Scale,

      title: "Weight Loss",

      body: "Physician-guided GLP-1 and metabolic support tailored to your health history — not a one-size-fits-all program.",

      accent: "coral" as const,

      cta: "Explore Weight Care",

    },

    {

      icon: Activity,

      title: "Chronic Care",

      body: "Ongoing management for hypertension, diabetes, and other conditions — with a doctor who knows your chart.",

      accent: "teal" as const,

      cta: "Explore Chronic Care",

    },

  ];



  return (

    <section id="services" className="section-padding bg-card">

      <div className="section-container text-center">

        <AnimatedSection>

          <p className="section-label-teal">OUR SERVICES</p>

          <h2 className="section-headline">Complete Care, One Trusted Physician.</h2>

          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto mb-12">

            From acute concerns to long-term wellness — every pathway is physician-reviewed and built around you.

          </p>

        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">

          {services.map((service, i) =>

            <AnimatedSection key={i} delay={i * 0.12}>

              <div className={`card-base card-hover h-full flex flex-col text-left card-teal-accent ${service.accent === "teal" ? "card-teal" : ""}`}>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${service.accent === "teal" ? "bg-teal/10" : "bg-coral/10"}`}>

                  <service.icon className={`w-6 h-6 ${service.accent === "teal" ? "text-teal" : "text-coral"}`} />

                </div>

                <h3 className="font-display text-foreground text-xl font-semibold mb-3">{service.title}</h3>

                <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1 mb-6">{service.body}</p>

                <Link

                  to="/quiz"

                  className={service.accent === "teal" ? "link-primary" : "link-accent"}

                >

                  {service.cta} →

                </Link>

              </div>

            </AnimatedSection>

          )}

        </div>

      </div>

    </section>

  );

};





const HowItWorks = () => {

  const steps = [

    { num: "01", icon: ClipboardList, title: "Answer a Short Questionnaire", body: "Tell us about your health history in about 5 minutes. No embarrassing office visits. No waiting room. Complete it from anywhere." },

    { num: "02", icon: Stethoscope, title: "A Real Physician Reviews Your Case", body: "A physician personally reviews every consultation within 24 hours and determines the safest, most effective treatment for you." },

    { num: "03", icon: Package, title: "Your Medication Ships to You", body: "If appropriate, your prescription is sent to a licensed pharmacy and shipped in discreet, unmarked packaging — straight to your door." },

  ];



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

              <div className="card-base card-hover text-center h-full group">

                <span className="font-display text-5xl text-teal/25 font-light group-hover:text-teal/40 transition-colors">{step.num}</span>

                <step.icon className="w-10 h-10 text-primary mx-auto mt-4 mb-4" />

                <h3 className="font-display text-foreground text-xl font-semibold mb-3">{step.title}</h3>

                <p className="font-body text-muted-foreground text-sm leading-relaxed">{step.body}</p>

              </div>

            </AnimatedSection>

          )}

        </div>

      </div>

    </section>

  );

};





const Treatments = () => {

  const cards = [

    { title: "Tadalafil Daily", subtitle: "Once-Daily Freedom", body: "Take it every day and be ready whenever the moment is right. No planning. No timing. Just confidence.", detail: "5mg · Daily dosing", price: "From $75/month", popular: true },

    { title: "Sildenafil", subtitle: "When You Need It", body: "Take it 30–60 minutes before intimacy. Works for 4–6 hours. Flexible and effective.", detail: "25–100mg · As-needed", price: "From $75/month", popular: false },

    { title: "Tadalafil As-Needed", subtitle: "The Weekend Option", body: "Take it before intimacy and stay ready for up to 36 hours. Ideal for planned occasions.", detail: "10–20mg · As-needed", price: "From $75/month", popular: false },

  ];



  return (

    <section id="treatments" className="section-padding bg-card">

      <div className="section-container text-center">

        <AnimatedSection>

          <p className="section-label-coral">ED TREATMENT</p>

          <h2 className="section-headline">FDA-Approved ED Treatment, Personalized for You.</h2>

        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 mt-12">

          {cards.map((card, i) =>

            <AnimatedSection key={i} delay={i * 0.15}>

              <div className="card-base card-hover relative h-full flex flex-col border-coral/10 hover:border-coral/25">

                {card.popular &&

                  <span className="absolute -top-3 right-6 badge-popular">

                    Most Popular

                  </span>

                }

                <h3 className="font-display text-foreground text-2xl font-bold mb-1">{card.title}</h3>

                <p className="font-body text-coral font-medium text-sm mb-4">{card.subtitle}</p>

                <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{card.body}</p>

                <p className="font-body text-muted-foreground text-xs mb-2">{card.detail}</p>

                <p className="font-display text-foreground text-lg font-bold mb-6">{card.price}</p>

                <Link to="/quiz" className="btn-accent w-full">Get Started →</Link>

              </div>

            </AnimatedSection>

          )}

        </div>

      </div>

    </section>

  );

};





const ChronicCare = () => {

  const items = [

    "Hypertension & blood pressure management",

    "Type 2 diabetes monitoring and medication",

    "Lipid management and cardiovascular risk",

    "Ongoing physician messaging and follow-up",

  ];



  return (

    <section id="chronic-care" className="section-padding bg-off-white">

      <div className="section-container">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <AnimatedSection>

            <p className="section-label-teal">CHRONIC CARE</p>

            <h2 className="section-headline">Long-Term Health, Continuously Managed.</h2>

            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-8">

              Chronic conditions need more than a one-time prescription. Dr. Merrick provides ongoing oversight — adjusting treatment as your health evolves, with the same rigor he'd bring in a hospital setting.

            </p>

            <ul className="space-y-4 mb-8">

              {items.map((item, i) =>

                <li key={i} className="flex items-start gap-3">

                  <Check className="text-teal w-5 h-5 mt-0.5 flex-shrink-0" />

                  <span className="font-body text-foreground text-sm">{item}</span>

                </li>

              )}

            </ul>

            <Link to="/quiz" className="btn-teal">Start Chronic Care Intake →</Link>

          </AnimatedSection>

          <AnimatedSection delay={0.15}>

            <div className="card-teal card-hover p-10">

              <div className="flex items-center gap-3 mb-6">

                <span className="status-pill status-success">

                  <span className="status-dot-success animate-pulse-dot" /> Physician Available

                </span>

              </div>

              <h3 className="font-display text-navy text-2xl font-bold mb-4">Why ongoing care matters</h3>

              <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">

                Unmanaged chronic conditions are the leading cause of preventable complications. Regular physician oversight catches problems early and keeps your treatment plan current.

              </p>

              <p className="font-body text-muted-foreground text-sm leading-relaxed">

                Every chronic care patient gets secure messaging with their physician — not a chatbot, not a nurse line.

              </p>

            </div>

          </AnimatedSection>

        </div>

      </div>

    </section>

  );

};





const WhyChooseUs = () => {

  const features = [

    "Real physician review",

    "Results within 24 hours",

    "$75/month — no surprise fees",

    "Discreet billing and shipping",

    "Cancel or pause anytime",

    "Licensed in Tennessee",

  ];



  return (

    <section className="section-navy-band section-padding">

      <div className="section-container text-center relative z-10">

        <AnimatedSection>

          <p className="section-label-light mb-4">WHY SPRYMD</p>

          <h2 className="section-headline-light">

            Not a Staffing Agency. A Real Doctor Who Cares.

          </h2>

          <p className="font-body text-primary-foreground/70 text-lg max-w-[600px] mx-auto mb-4">

            At SpryMD, you're not filling out a form that gets routed to whoever is available. A board-certified physician personally reviews every case — every prescription, every follow-up.

          </p>

          <p className="font-body text-primary-foreground/70 text-lg max-w-[600px] mx-auto mb-12">

            That means better clinical judgment, more personalized care, and a physician who is accountable to you — not a quota.

          </p>

        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">

          {features.map((feature, i) =>

            <AnimatedSection key={i} delay={i * 0.1}>

              <div className="bg-card/10 border border-primary-foreground/10 rounded-xl p-5 text-left backdrop-blur-sm hover:bg-card/15 transition-colors duration-300">

                <div className="flex items-start gap-3">

                  <Check className="text-teal-light w-5 h-5 mt-0.5 flex-shrink-0" />

                  <span className="font-body text-primary-foreground text-sm font-medium">{feature}</span>

                </div>

              </div>

            </AnimatedSection>

          )}

        </div>

      </div>

    </section>

  );

};





const PricingSection = () => {

  const items = [

    "Physician-reviewed consultation",

    "Prescription (if clinically appropriate)",

    "Licensed pharmacy fulfillment",

    "Secure provider messaging",

    "Monthly auto-refills",

    "Cancel anytime — no penalty",

  ];



  return (

    <section id="pricing" className="section-padding bg-off-white">

      <div className="section-container text-center">

        <AnimatedSection>

          <p className="section-label">PRICING</p>

          <h2 className="section-headline">Transparent Pricing. No Hidden Fees.</h2>

        </AnimatedSection>

        <AnimatedSection delay={0.2}>

          <div className="card-base card-hover shadow-lg max-w-[480px] mx-auto p-12 rounded-3xl border-primary/10">

            <div className="mb-6">

              <span className="font-display text-foreground text-7xl md:text-8xl font-bold">$75</span>

              <span className="font-body text-muted-foreground text-2xl">/month</span>

            </div>

            <div className="w-full h-px bg-gray-light mb-6" />

            <ul className="text-left space-y-3 mb-8">

              {items.map((item, i) =>

                <li key={i} className="flex items-center gap-3">

                  <Check className="text-teal w-5 h-5 flex-shrink-0" />

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

    </section>

  );

};





const GetCare = () =>

  <section id="get-care" className="section-padding-sm bg-card border-y border-gray-light">

    <div className="section-container">

      <div className="grid md:grid-cols-3 gap-6 text-center">

        {[

          { label: "ED Treatment", desc: "Start in 5 minutes", href: "/quiz", btn: "btn-accent" },

          { label: "Weight Loss", desc: "Physician-guided plans", href: "/quiz", btn: "btn-accent" },

          { label: "Chronic Care", desc: "Ongoing management", href: "/quiz", btn: "btn-teal" },

        ].map((path, i) =>

          <AnimatedSection key={i} delay={i * 0.1}>

            <div className="card-base card-hover p-8">

              <h3 className="font-display text-navy text-xl font-semibold mb-2">{path.label}</h3>

              <p className="font-body text-muted-foreground text-sm mb-5">{path.desc}</p>

              <Link to={path.href} className={`${path.btn} w-full text-sm px-6 py-3`}>

                Get Care →

              </Link>

            </div>

          </AnimatedSection>

        )}

      </div>

    </div>

  </section>;





const FAQTeaser = () => {

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [

    { q: "Is this real medical care?", a: "Yes. Every consultation is reviewed by a licensed, board-certified physician — not a chatbot or algorithm. You receive a real prescription from a real doctor who is professionally and legally accountable for your care." },

    { q: "Is it completely private?", a: "Completely. Your information is HIPAA-protected, stored on encrypted servers, billed discreetly, and shipped in unmarked packaging. We will never share your health information." },

    { q: "What if I'm not a good candidate?", a: "If our physician determines that ED medication isn't clinically appropriate based on your health history, we'll explain why and issue a full refund. Your safety matters more than a transaction." },

  ];



  return (

    <section className="section-padding bg-card">

      <div className="section-container max-w-3xl">

        <AnimatedSection>

          <h2 className="section-headline text-center">Common Questions</h2>

        </AnimatedSection>

        <div className="space-y-4">

          {faqs.map((faq, i) =>

            <AnimatedSection key={i} delay={i * 0.1}>

              <div className="card-base p-0 overflow-hidden">

                <button

                  onClick={() => setOpenIndex(openIndex === i ? null : i)}

                  className="w-full flex items-center justify-between p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"

                >

                  <span className="font-display text-foreground text-lg font-semibold pr-4">{faq.q}</span>

                  <ChevronDown className={`text-muted-foreground w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />

                </button>

                <AnimatePresence>

                  {openIndex === i &&

                    <motion.div

                      initial={{ height: 0, opacity: 0 }}

                      animate={{ height: "auto", opacity: 1 }}

                      exit={{ height: 0, opacity: 0 }}

                      transition={{ duration: 0.3 }}

                    >

                      <p className="font-body text-muted-foreground text-sm leading-relaxed px-6 pb-6">{faq.a}</p>

                    </motion.div>

                  }

                </AnimatePresence>

              </div>

            </AnimatedSection>

          )}

        </div>

        <div className="text-center mt-8">

          <Link to="/faq" className="link-primary">

            See all FAQs →

          </Link>

        </div>

      </div>

    </section>

  );

};





const FooterCTA = () =>

  <section className="section-navy-band section-padding text-center">

    <div className="section-container relative z-10">

      <AnimatedSection>

        <h2 className="section-headline-light">Ready to get started?</h2>

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

    <Services />

    <HowItWorks />

    <Treatments />

    <ChronicCare />

    <WhyChooseUs />

    <PricingSection />

    <GetCare />

    <FAQTeaser />

    <section className="section-padding-sm bg-off-white">
      <MedicalDisclaimer variant="marketing" />
    </section>

    <FooterCTA />

  </main>;





export default Index;


