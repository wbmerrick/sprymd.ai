import { Link } from "react-router-dom";
import { GraduationCap, ClipboardCheck, Building, Stethoscope, Lock, Pill } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { brandPlates } from "@/assets/brand/catalog";

const AboutHero = () => (
  <section className="relative overflow-hidden py-32 px-4 text-center">
    <img
      src={brandPlates.care.src}
      srcSet={`${brandPlates.care.srcSmall} 960w, ${brandPlates.care.src} 1920w`}
      sizes="100vw"
      alt=""
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
      style={{ objectPosition: "center 58%" }}
    />
    <div className="absolute inset-0 bg-black/40" />
    <div className="section-container relative z-10">
      <AnimatedSection>
        <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold mb-4">About SpryMD</h1>
        <p className="font-body text-primary-foreground/70 text-xl">Modern medicine, made for men and women.</p>
      </AnimatedSection>
    </div>
  </section>
);

const DoctorBio = () => (
  <section className="section-padding bg-card">
    <div className="section-container">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <AnimatedSection>
          <div className="relative rounded-2xl shadow-xl overflow-hidden bg-navy aspect-[3/4] flex flex-col items-center justify-center px-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate to-navy" />
            <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-blue/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-blue-light/10 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
                <Stethoscope className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-primary-foreground text-2xl font-bold">Licensed clinical care</p>
                <p className="font-body text-primary-foreground/70 mt-2 text-sm">Telehealth for men in Tennessee</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {["Licensed clinicians", "Tennessee service area", "Private & discreet"].map((b, i) => (
              <span key={i} className="font-body text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <h2 className="font-display text-navy text-3xl md:text-4xl font-bold mb-2">Care without the waiting room</h2>
          <p className="font-body text-primary font-medium mb-6">Clinician-reviewed telehealth · Tennessee</p>
          <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
            <p>SpryMD is a telehealth practice for men who want clear, private care — without sitting in a waiting room or explaining themselves in public.</p>
            <p>This platform exists to remove the usual barriers: scheduling weeks out, awkward in-person visits, and care that feels like a mill. A licensed clinician reviews every case. Treatment ships only when it is clinically appropriate.</p>
            <p>We currently care for patients located in Tennessee. Discretion matters. Every visit gets the same attention you would expect in a clinic.</p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

const CredentialsGrid = () => {
  const creds = [
    { icon: Stethoscope, text: "Licensed clinician review on every case" },
    { icon: ClipboardCheck, text: "Treatment only when clinically appropriate" },
    { icon: Building, text: "Tennessee service area" },
    { icon: Lock, text: "HIPAA-compliant practice" },
    { icon: Pill, text: "Pharmacy fulfillment after approval" },
    { icon: GraduationCap, text: "Private telehealth — no waiting rooms" },
  ];

  return (
    <section className="section-padding bg-off-white">
      <div className="section-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creds.map((c, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="card-base text-center card-hover">
                <c.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-body text-navy font-medium text-sm">{c.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

const Philosophy = () => (
  <section className="section-padding bg-navy">
    <div className="section-container max-w-3xl text-center">
      <AnimatedSection>
        <h2 className="font-display text-primary-foreground text-3xl md:text-[42px] font-bold leading-tight mb-8">
          Medicine Should Meet You Where You Are.
        </h2>
        <div className="space-y-5 font-body text-primary-foreground/70 text-lg">
          <p>The traditional model of healthcare makes you schedule weeks out, sit in a waiting room, and have a conversation you'd rather not have — just to get a prescription that should take five minutes to review.</p>
          <p>Asynchronous telehealth lets you complete your intake on your time, from anywhere, with complete privacy. Your physician reviews the same information he'd collect in-office and makes the same clinical decision — without the friction.</p>
          <p className="font-semibold text-primary-foreground">That's not cutting corners. That's modern medicine.</p>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

const NotAPillMill = () => (
  <section className="section-padding bg-card">
    <div className="section-container max-w-3xl text-center">
      <AnimatedSection>
        <h2 className="section-headline">This Isn't a Pill Mill. This Is a Medical Practice.</h2>
        <div className="space-y-4 font-body text-muted-foreground text-lg mb-8">
          <p>We screen every patient carefully. We decline to prescribe when it's not clinically appropriate. We follow up. We treat you like a patient — because that's what you are.</p>
          <p>If you're not a good candidate for ED medication based on your health history, we'll tell you honestly, explain why, and issue a full refund. Your safety matters more than a transaction.</p>
        </div>
        <p className="font-body text-navy font-medium mb-6">Ready to work with a doctor who takes your health seriously?</p>
        <Link to="/#landing-conditions" className="btn-primary">Start My Consultation →</Link>
      </AnimatedSection>
    </div>
  </section>
);

const About = () => (
  <>
    <Navbar />
    <main id="main-content" className="pt-16">
      <AboutHero />
      <DoctorBio />
      <CredentialsGrid />
      <Philosophy />
      <NotAPillMill />
    </main>
    <Footer />
  </>
);

export default About;
