import { Link } from "react-router-dom";
import { SPRY_MD_COLOR } from "@/brand/tokens";
import { COMPANY, companyTelHref } from "@/config/company";

const Footer = () => {
  const telHref = companyTelHref();
  return (
    <footer className="bg-navy-deep py-12 px-4 md:px-8 border-t border-white/10">
      <div className="section-container">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-2">
            <p className="font-display text-primary-foreground text-xl font-bold">
              Spry<span style={{ color: SPRY_MD_COLOR }}>MD</span>.ai
            </p>
            <p className="font-body text-primary-foreground/50 text-sm max-w-md">
              © 2026 {COMPANY.LEGAL_NAME}. Telehealth services provided by licensed clinicians for patients in {COMPANY.AREA_SERVED}.
            </p>
            <address className="mt-4 not-italic font-body text-primary-foreground/60 text-sm leading-relaxed max-w-md">
              <div>{COMPANY.ADDRESS}</div>
              {telHref ? (
                <a href={telHref} className="block mt-1 text-primary-foreground/80 hover:text-primary-foreground transition-colors" aria-label={`Call ${COMPANY.PHONE}`}>
                  {COMPANY.PHONE}
                </a>
              ) : (
                <div className="mt-1">{COMPANY.PHONE}</div>
              )}
              <a href={`mailto:${COMPANY.SUPPORT_EMAIL}`} className="block mt-1 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                {COMPANY.SUPPORT_EMAIL}
              </a>
              <div className="mt-1 text-primary-foreground/50">{COMPANY.SUPPORT_HOURS}</div>
            </address>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-start text-xs">
            {[
              { to: "/terms", label: "Terms of Service" },
              { to: "/privacy", label: "Privacy Policy" },
              { to: "/npp", label: "Notice of Privacy Practices" },
              { to: "/faq", label: "FAQ" },
              { to: "/contact", label: "Contact" },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="font-body text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
