import { FormEvent, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";

const SUPPORT = "support@sprymd.ai";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.message || `We couldn't send that. Email ${SUPPORT}.`);
        return;
      }
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError(`Network error. Please email ${SUPPORT}.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="bg-navy py-24 px-4 text-center">
        <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="font-body text-primary-foreground/70 text-lg">We aim to reply within one business day.</p>
      </section>
      <section className="section-padding bg-card">
        <div className="section-container max-w-lg">
          <AnimatedSection>
            <div className="card-base">
              {sent ? (
                <div className="space-y-3 text-center py-4">
                  <p className="font-display text-navy text-xl font-semibold">Message sent</p>
                  <p className="font-body text-muted-foreground text-sm">
                    Thanks — we received your note. If it is urgent clinically, call 911. For account issues you can also email{" "}
                    <a className="underline" href={`mailto:${SUPPORT}`}>{SUPPORT}</a>.
                  </p>
                  <button type="button" className="btn-secondary" onClick={() => setSent(false)}>
                    Send another
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div>
                    <label className="font-body text-navy text-sm font-medium mb-1 block" htmlFor="contact-name">Name</label>
                    <input
                      id="contact-name"
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary transition-colors"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="font-body text-navy text-sm font-medium mb-1 block" htmlFor="contact-email">Email</label>
                    <input
                      id="contact-email"
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy focus:outline-none focus:border-primary transition-colors"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="font-body text-navy text-sm font-medium mb-1 block" htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      required
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      rows={5}
                      className="w-full rounded-xl border-2 border-gray-light p-3 font-body text-navy resize-none focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  {error && (
                    <p role="alert" className="font-body text-sm text-red-600">{error}</p>
                  )}
                  <button type="submit" className="btn-primary w-full disabled:opacity-60" disabled={loading}>
                    {loading ? "Sending…" : "Send Message"}
                  </button>
                  <p className="font-body text-xs text-muted-foreground text-center">
                    Or email <a className="underline" href={`mailto:${SUPPORT}`}>{SUPPORT}</a>
                  </p>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Contact;
