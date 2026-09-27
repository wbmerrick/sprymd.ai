import { Link } from "react-router-dom";
import { SPRY_MD_COLOR } from "@/brand/tokens";

const Footer = () => {
  return (
    <footer className="bg-navy-deep py-12 px-4 md:px-8 border-t border-white/10">
      <div className="section-container">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-2">
            <p className="font-display text-primary-foreground text-xl font-bold">
              Spry<span style={{ color: SPRY_MD_COLOR }}>MD</span>.ai
            </p>
            <p className="font-body text-primary-foreground/70 text-xs max-w-md leading-relaxed">
              SpryMD Telehealth Tennessee P.C. · 414 Union Street, Suite 1900, Nashville, TN 37219<br />
              Direct: (615) 802-SPRY / (615) 802-7779 · Email: support@sprymd.ai
            </p>
            <p className="font-body text-primary-foreground/50 text-[11px] max-w-md leading-relaxed">
              © 2026 SpryMD.ai. 100% Direct cash-pay telehealth platform. Prescriptions compounded and fulfilled through Empower Pharmacy for eligible Tennessee residents.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-start text-xs">
            {[
              { to: "/terms", label: "Terms of Service" },
              { to: "/privacy", label: "Privacy Policy" },
              { to: "/npp", label: "Notice of Privacy Practices" },
              { to: "/faq", label: "FAQ" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-primary-foreground/70 hover:text-primary transition-colors"
              >
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
