import AnimatedSection from "@/components/AnimatedSection";

const Terms = () => (
  <main>
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">Terms of Service</h1>
    </section>
    <section className="section-padding bg-card">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none">
            <p className="text-lg font-medium text-foreground mb-4">Effective Date: [DATE]</p>
            <p>Please replace this placeholder with your Terms of Service content. This page should outline the terms and conditions governing the use of your telehealth platform, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Eligibility requirements</li>
              <li>Description of services</li>
              <li>Payment terms and billing</li>
              <li>Cancellation and refund policy</li>
              <li>Limitation of liability</li>
              <li>Governing law and dispute resolution</li>
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default Terms;
