import { useState } from "react";
import { Phone, Mail, MapPin, Clock, ShieldAlert, CheckCircle2, Building2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", topic: "Support", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-off-white">
      <section className="bg-navy py-20 px-4 text-center">
        <div className="section-container max-w-4xl">
          <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold mb-3">
            Contact SpryMD Care & Operations
          </h1>
          <p className="font-body text-primary-foreground/75 text-base md:text-lg max-w-2xl mx-auto">
            Direct access to our Tennessee clinical coordination team, pharmacy fulfillment desk, and patient support.
          </p>
        </div>
      </section>

      <section className="section-padding bg-card py-12 md:py-16">
        <div className="section-container max-w-5xl">
          <AnimatedSection>
            <div className="grid md:grid-cols-12 gap-8">
              {/* Left Column: Standardized Location & Directory */}
              <div className="md:col-span-5 space-y-6">
                <div className="card-base p-6 space-y-5">
                  <h2 className="font-display text-navy text-xl font-bold border-b border-gray-light pb-3">
                    Clinic & Operating Location
                  </h2>

                  <div className="space-y-4 text-sm text-navy">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-navy">SpryMD Telehealth Tennessee P.C.</p>
                        <p className="text-muted-foreground text-xs mt-0.5">Licensed Medical Practice</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-navy">Physical Practice Address</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          414 Union Street, Suite 1900<br />
                          Nashville, TN 37219<br />
                          United States
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-navy">Direct Phone & SMS</p>
                        <p className="text-primary font-mono text-sm font-bold">
                          (615) 802-SPRY
                        </p>
                        <p className="text-muted-foreground text-xs">(615) 802-7779</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-navy">Clinical Review & Support Hours</p>
                        <p className="text-muted-foreground text-xs">
                          Monday – Friday: 8:00 AM – 7:00 PM CT<br />
                          Saturday – Sunday: 9:00 AM – 4:00 PM CT
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-base p-6 space-y-3 text-xs">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider text-primary">
                    Specialized Inquiries
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      <strong className="text-navy">Patient Support:</strong>{" "}
                      <a href="mailto:support@sprymd.ai" className="text-primary underline">support@sprymd.ai</a>
                    </p>
                    <p>
                      <strong className="text-navy">Privacy Officer:</strong>{" "}
                      <a href="mailto:privacy@sprymd.ai" className="text-primary underline">privacy@sprymd.ai</a>
                    </p>
                    <p>
                      <strong className="text-navy">Press & Partnerships:</strong>{" "}
                      <a href="mailto:press@sprymd.ai" className="text-primary underline">press@sprymd.ai</a>
                    </p>
                    <p>
                      <strong className="text-navy">Dispensing Pharmacy:</strong> Empower Pharmacy (503A / 503B Licensed Partner)
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-navy flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Medical Emergency Notice:</strong> SpryMD is an asynchronous telehealth service. If you are experiencing chest pain, difficulty breathing, priapism &gt;4 hours, or an acute psychiatric crisis, call <strong>911</strong> or <strong>988</strong> immediately.
                  </p>
                </div>
              </div>

              {/* Right Column: Contact Message Form */}
              <div className="md:col-span-7">
                <div className="card-base p-6 md:p-8">
                  <h2 className="font-display text-navy text-2xl font-bold mb-2">
                    Send a Message to Support
                  </h2>
                  <p className="font-body text-xs text-muted-foreground mb-6">
                    Our Nashville-based team responds to all inquiries within one business day.
                  </p>

                  {submitted ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-600/10 text-emerald-600 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-navy text-xl font-bold">Message Received</h3>
                      <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
                        Thank you, {form.name}. We have routed your inquiry to our Nashville care team and will respond to {form.email} within 24 hours.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setForm({ name: "", email: "", topic: "Support", message: "" });
                        }}
                        className="btn-secondary text-xs mt-4"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="font-body text-navy text-xs font-semibold mb-1 block">Full Name</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Your legal name"
                          className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label className="font-body text-navy text-xs font-semibold mb-1 block">Email Address</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label className="font-body text-navy text-xs font-semibold mb-1 block">Inquiry Topic</label>
                        <select
                          value={form.topic}
                          onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                          className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy focus:outline-none focus:border-primary transition-colors bg-white"
                        >
                          <option value="Support">Account & Protocol Support</option>
                          <option value="Refills">Pharmacy Refills & Cold-Chain Shipping</option>
                          <option value="Billing">Direct Cash-Pay Billing & Receipts</option>
                          <option value="Privacy">HIPAA Privacy & Data Requests</option>
                          <option value="Press">Press & Media</option>
                          <option value="Other">Other Question</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-body text-navy text-xs font-semibold mb-1 block">Message</label>
                        <textarea
                          required
                          value={form.message}
                          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                          rows={5}
                          placeholder="Please provide details regarding your inquiry..."
                          className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-sm text-navy resize-none focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <button type="submit" className="btn-primary w-full py-3 text-sm font-semibold">
                        Send Message →
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Contact;
