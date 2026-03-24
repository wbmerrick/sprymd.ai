import AnimatedSection from "@/components/AnimatedSection";

const Privacy = () => (
  <main>
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">Privacy Policy</h1>
    </section>
    <section className="section-padding bg-card">
      <div className="section-container max-w-3xl">
        <AnimatedSection>
          <div className="prose prose-sm font-body text-muted-foreground max-w-none">
            <p className="text-lg font-medium text-foreground mb-4">Effective Date: [DATE]</p>
            <p>Please replace this placeholder with your Privacy Policy content. This page should detail how your practice collects, uses, stores, and protects personal and health information, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Types of information collected</li>
              <li>How information is used</li>
              <li>Data sharing and disclosure practices</li>
              <li>Data retention and security measures</li>
              <li>Patient rights under HIPAA</li>
              <li>Contact information for privacy concerns</li>
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default Privacy;
