import { useOutletContext } from "react-router-dom";
import { StaffInboxPanel } from "@/components/dashboard/pro/StaffInboxPanel";

/** Dedicated All Contacts screen — message any customer / patient. */
export default function StaffContactsPage() {
  const { email } = useOutletContext<{ email: string; name: string }>();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">
          Clinician workspace
        </p>
        <h1
          className="text-2xl font-semibold text-white md:text-3xl"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          All contacts
        </h1>
        <p className="max-w-2xl text-sm text-zinc-500">
          Select any patient to open an existing thread or start a new care message — so the team
          can relay information whenever needed.
        </p>
      </header>

      <StaffInboxPanel userEmail={email} compact initialView="contacts" />
    </div>
  );
}
