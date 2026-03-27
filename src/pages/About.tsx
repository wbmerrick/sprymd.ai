import { Link } from "react-router-dom";
import { GraduationCap, ClipboardCheck, Building, Stethoscope, Lock, Pill } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import doctorPhoto from "@/assets/doctor-photo.png";

const AboutHero = () => (
  <section className="bg-navy py-24 px-4 text-center">
    <div className="section-container">
      <AnimatedSection>
        <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold mb-4">About Your Doctor</h1>
        <p className="font-body text-primary-foreground/70 text-xl">Real medicine. Real experience. Real results.</p>
      </AnimatedSection>
    </div>
  </section>
);

const DoctorBio = () => (
  <section className="section-padding bg-card">
    <div className="section-container">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <AnimatedSection>
          <div className="rounded-2xl shadow-xl overflow-hidden">
            <img src={doctorPhoto} alt="Dr. Merrick — Board-Certified Physician" className="w-full h-auto object-contain" />
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {["Board-Certified DO", "Licensed in Tennessee", "[X]+ Years Experience"].map((b, i) => (
              <span key={i} className="font-body text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <h2 className="font-display text-foreground text-3xl md:text-4xl font-bold mb-2">William Merrick, DO</h2>
          <p className="font-body text-primary font-medium mb-6">Board-Certified Physician · Telehealth Provider</p>
          <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
            <p>Dr. Merrick is an internal medicine board-certified osteopathic physician with over 10 years of clinical experience in hospital medicine, outpatient care, and chronic disease management. He practices brings the same rigor of hospital-level medicine to every telehealth consultation.</p>
            <p>He built this practice for a simple reason: millions of men suffer from and deal with ED in silence because they're embarrassed, too busy, or priced out of traditional care. That's not a medical problem — that's a system problem. This platform exists to remove every barrier between you and effective treatment.</p>
            <p>Dr. Merrick lives and practices in rural Tennessee. He understands that not every patient has easy access to specialists or same-day appointments — and that discretion matters. Every case he reviews gets the same attention he'd give a patient in his clinic.</p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

const CredentialsGrid = () => {
  const creds = [
    { icon: GraduationCap, text: "Doctor of Osteopathic Medicine (DO)" },
    { icon: ClipboardCheck, text: "Board Certified — American Osteopathic Board of Internal Medicine" },
    { icon: Building, text: "Licensed in Tennessee" },
    { icon: Stethoscope, text: "[X]+ Years Clinical Experience" },
    { icon: Lock, text: "HIPAA-Compliant Practice" },
    { icon: Pill, text: "Hospital Medicine · Telehealth" },
  ];

  return (
    <section className="section-padding bg-off-white">
      <div className="section-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creds.map((c, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="card-base text-center card-hover">
                <c.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-body text-foreground font-medium text-sm">{c.text}</p>
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
        <p className="font-body text-foreground font-medium mb-6">Ready to work with a doctor who takes your health seriously?</p>
        <Link to="/quiz" className="btn-primary">Start My Consultation →</Link>
      </AnimatedSection>
    </div>
  </section>
);

const About = () => (
  <main>
    <AboutHero />
    <DoctorBio />
    <CredentialsGrid />
    <Philosophy />
    <NotAPillMill />
  </main>
);

export default About;
