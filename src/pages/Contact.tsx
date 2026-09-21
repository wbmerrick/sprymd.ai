import { useState } from "react";

import { toast } from "sonner";

import AnimatedSection from "@/components/AnimatedSection";

import { supabase } from "@/integrations/supabase/client";

import { COMPANY } from "@/lib/company";

import { isSupabaseConfigured } from "@/lib/intake/persist";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contact = () => {

  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name) {
      toast.error("Please enter your name.");
      return;
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!message) {
      toast.error("Please enter a message.");
      return;
    }

    if (!isSupabaseConfigured()) {
      // No backend configured — hand off to the user's mail client instead.
      const subject = encodeURIComponent("SpryMD contact form inquiry");
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:${COMPANY.email}?subject=${subject}&body=${body}`;
      toast.info(`Opening your email app — you can also reach us directly at ${COMPANY.email}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert({ name, email, message });

      if (error) throw error;

      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", message: "" });

    } catch {

      toast.error(`Something went wrong sending your message. Please try again or email us at ${COMPANY.email}.`);

    } finally {

      setIsSubmitting(false);

    }

  };

  return (

    <main>

      <section className="page-hero">

        <div className="page-hero-band" />

        <div className="page-hero-content">

          <AnimatedSection>

            <p className="section-label mb-4">GET IN TOUCH</p>

            <h1 className="font-display text-navy text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>

            <p className="font-body text-muted-foreground text-lg">We respond to all inquiries within 24 hours.</p>

          </AnimatedSection>

        </div>

      </section>

      <section className="section-padding bg-card -mt-8 relative z-10">

        <div className="section-container max-w-lg">

          <AnimatedSection>

            <div className="card-base card-hover">

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                <div>

                  <label htmlFor="contact-name" className="font-body text-foreground text-sm font-medium mb-1 block">Name</label>

                  <input

                    id="contact-name"

                    name="name"

                    type="text"

                    required

                    autoComplete="name"

                    value={form.name}

                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}

                    className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 transition-colors"

                  />

                </div>

                <div>

                  <label htmlFor="contact-email" className="font-body text-foreground text-sm font-medium mb-1 block">Email</label>

                  <input

                    id="contact-email"

                    name="email"

                    type="email"

                    required

                    autoComplete="email"

                    value={form.email}

                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}

                    className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 transition-colors"

                  />

                </div>

                <div>

                  <label htmlFor="contact-message" className="font-body text-foreground text-sm font-medium mb-1 block">Message</label>

                  <textarea

                    id="contact-message"

                    name="message"

                    required

                    value={form.message}

                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}

                    rows={5}

                    className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-foreground resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 transition-colors"

                  />

                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">

                  {isSubmitting ? "Sending…" : "Send Message"}

                </button>

              </form>

            </div>

          </AnimatedSection>

        </div>

      </section>

    </main>

  );

};

export default Contact;
