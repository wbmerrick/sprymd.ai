import { useState, type FormEvent } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUPPORT_EMAIL = "support@sprymd.ai";

const fieldClass =
  "w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  // No mail backend yet: hand the message to the visitor's mail client.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Website message from ${form.name.trim() || "a visitor"}`);
    const body = encodeURIComponent(`${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16">
        <section className="bg-navy py-24 px-4 text-center">
          <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="font-body text-primary-foreground/70 text-lg">We respond to all inquiries within 24 hours.</p>
        </section>
        <section className="section-padding bg-card">
          <div className="section-container max-w-lg">
            <AnimatedSection>
              <form className="card-base" onSubmit={onSubmit} aria-describedby="contact-help">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="font-body text-navy text-sm font-medium mb-1 block">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="font-body text-navy text-sm font-medium mb-1 block">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="font-body text-navy text-sm font-medium mb-1 block">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      rows={5}
                      className={`${fieldClass} resize-none`}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>
                  <p id="contact-help" className="font-body text-muted-foreground text-sm text-center">
                    Sending opens your email app addressed to{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline">
                      {SUPPORT_EMAIL}
                    </a>
                    . For emergencies, call 911.
                  </p>
                </div>
              </form>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
