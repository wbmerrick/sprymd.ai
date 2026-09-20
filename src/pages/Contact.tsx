import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <main>
      <section className="bg-navy py-24 px-4 text-center">
        <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="font-body text-primary-foreground/70 text-lg">We respond to all inquiries within 24 hours.</p>
      </section>
      <section className="section-padding bg-card">
        <div className="section-container max-w-lg">
          <AnimatedSection>
            <div className="card-base">
              <div className="space-y-4">
                <div>
                  <label className="font-body text-navy text-sm font-medium mb-1 block">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-navy text-sm font-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-navy text-sm font-medium mb-1 block">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    rows={5}
                    className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy resize-none focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <button className="btn-primary w-full">Send Message</button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Contact;
