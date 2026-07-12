import { Pill } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const RefillRequest = () => (
  <div className="space-y-6">
    <AnimatedSection>
      <p className="section-label">Prescription renewal</p>
      <h1 className="font-display text-foreground text-3xl font-bold mb-2">Request a Refill</h1>
      <p className="font-body text-muted-foreground">
        Refill requests will be available once you're on active treatment.
      </p>
    </AnimatedSection>

    <AnimatedSection delay={0.1}>
      <div className="card-base text-center py-16">
        <Pill className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-display text-foreground text-lg font-semibold mb-2">Refills not yet available</h2>
        <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto mb-6">
          After your first prescription is fulfilled and you're in active care, you can request
          refills here. Your physician will review each renewal.
        </p>
        <button
          type="button"
          disabled
          className="btn-secondary opacity-50 cursor-not-allowed"
        >
          Request Refill (coming soon)
        </button>
      </div>
    </AnimatedSection>
  </div>
);

export default RefillRequest;
