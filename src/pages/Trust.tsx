import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const subprocessors = [
  {
    name: "Stripe, Inc.",
    purpose: "Payment processing, fraud prevention, subscription billing",
    data: "Name, email, billing address, payment method tokens, transaction metadata",
    location: "United States",
    policy: "https://stripe.com/us/privacy",
  },
  {
    name: "Supabase, Inc.",
    purpose: "Application database, authentication, encrypted storage of intake responses",
    data: "Account identifiers, questionnaire responses, audit timestamps",
    location: "United States (AWS us-east-1)",
    policy: "https://supabase.com/privacy",
  },
];

const baaInventory = [
  {
    party: "William Merrick, DO (Medical Group / Provider)",
    status: "Covered entity — NPP published at /npp",
    scope: "Clinical telehealth encounters, prescriptions, PHI created in care delivery",
  },
  {
    party: "SpryMD Technologies, LLC (platform)",
    status: "Business associate where applicable",
    scope: "Hosting intake workflows, secure messaging relay, PHI access limited to contracted services",
  },
  {
    party: "Stripe, Inc.",
    status: "No BAA — processes payment data only, not PHI for treatment",
    scope: "Card and billing data segregated from clinical charts",
  },
  {
    party: "Supabase, Inc.",
    status: "BAA required before production PHI storage",
    scope: "Encrypted application data; BAAs executed prior to live PHI workloads",
  },
];

const Trust = () => (
  <main>
    <section className="bg-navy py-24 px-4 text-center">
      <h1 className="font-display text-primary-foreground text-4xl md:text-5xl font-bold">
        Trust Center
      </h1>
      <p className="font-body text-primary-foreground/70 mt-4 max-w-2xl mx-auto">
        How SpryMD protects patient data, which vendors we use, and where information flows.
      </p>
    </section>

    <section className="section-padding bg-card">
      <div className="section-container max-w-4xl space-y-16">
        <AnimatedSection>
          <h2 className="text-xl font-bold text-foreground mb-4">Data flow overview</h2>
          <p className="font-body text-muted-foreground text-sm mb-6">
            The diagram below shows the primary path for telehealth intake, payment, and clinical
            review. Protected health information (PHI) is handled only by parties with appropriate
            HIPAA obligations.
          </p>
          <pre
            className="font-mono text-xs md:text-sm bg-off-white border border-gray-light rounded-xl p-4 md:p-6 overflow-x-auto text-foreground leading-relaxed"
            aria-label="Data flow diagram"
          >
{`┌─────────────┐     HTTPS/TLS      ┌──────────────────┐
│   Patient   │ ─────────────────► │  SpryMD.ai (app) │
│   browser   │ ◄───────────────── │  React + Supabase │
└─────────────┘                    └────────┬─────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              │                             │                             │
              ▼                             ▼                             ▼
     ┌────────────────┐          ┌─────────────────┐          ┌──────────────────┐
     │ Stripe Checkout │          │ Supabase (auth/  │          │ William Merrick, │
     │ Payment tokens  │          │  DB, encrypted) │          │ DO — clinical    │
     │ No PHI charts   │          │ Intake + audit   │          │ review & Rx      │
     └────────────────┘          └─────────────────┘          └────────┬─────────┘
                                                                         │
                                                                         ▼
                                                              ┌──────────────────┐
                                                              │ Licensed pharmacy │
                                                              │ (fulfillment)     │
                                                              └──────────────────┘

Analytics (GTM / Plausible): optional, consent-gated — no PHI transmitted.`}
          </pre>
        </AnimatedSection>

        <AnimatedSection>
          <h2 className="text-xl font-bold text-foreground mb-4">Subprocessors</h2>
          <p className="font-body text-muted-foreground text-sm mb-6">
            We engage the following subprocessors to operate the Service. This list reflects
            vendors in active use or planned for production telehealth workflows.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Data categories</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subprocessors.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">
                    <a href={row.policy} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                      {row.name}
                    </a>
                  </TableCell>
                  <TableCell>{row.purpose}</TableCell>
                  <TableCell>{row.data}</TableCell>
                  <TableCell>{row.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AnimatedSection>

        <AnimatedSection>
          <h2 className="text-xl font-bold text-foreground mb-4">BAA inventory</h2>
          <p className="font-body text-muted-foreground text-sm mb-6">
            Business Associate Agreements (BAAs) govern how vendors may use or disclose PHI on our
            behalf. Status is reviewed before production launch and upon vendor changes.
          </p>
          <div className="space-y-4">
            {baaInventory.map((item) => (
              <div
                key={item.party}
                className="rounded-xl border border-gray-light p-5 bg-off-white/50"
              >
                <p className="font-body text-foreground font-semibold text-sm">{item.party}</p>
                <p className="font-body text-primary text-xs font-medium mt-1">{item.status}</p>
                <p className="font-body text-muted-foreground text-sm mt-2">{item.scope}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <p className="font-body text-muted-foreground text-sm">
            Questions about security or compliance? Email{" "}
            <a href="mailto:privacy@sprymd.ai" className="text-primary underline">
              privacy@sprymd.ai
            </a>{" "}
            or review our{" "}
            <Link to="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/npp" className="text-primary underline">
              Notice of Privacy Practices
            </Link>
            .
          </p>
        </AnimatedSection>
      </div>
    </section>
  </main>
);

export default Trust;
