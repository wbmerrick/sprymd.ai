import AnimatedSection from "@/components/AnimatedSection";

const NPP = () => (
  <main>
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">Notice of Privacy Practices</h1>
    </section>
    <section className="section-padding bg-card">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none">
            <p className="text-lg font-medium text-foreground mb-4">Effective Date: [DATE]</p>
            <p>Please replace this placeholder with your Notice of Privacy Practices (NPP) content as required under HIPAA. This document should explain:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>How protected health information (PHI) may be used and disclosed</li>
              <li>Patient rights regarding their PHI</li>
              <li>The practice's obligations to protect PHI</li>
              <li>How to file a complaint</li>
              <li>Contact information for the Privacy Officer</li>
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default NPP;
