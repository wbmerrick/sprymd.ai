import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-navy-deep py-12 px-4 md:px-8">
      <div className="section-container">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-display text-primary-foreground text-lg font-semibold mb-2">SpryMD.ai</p>
            <p className="font-body text-primary-foreground/50 text-sm max-w-md">© 2026 SpryMD.ai. Telehealth services provided by WILLIAM MERRICK, DO, licensed in Tennessee.

            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-start">
            {[
            { to: "/terms", label: "Terms of Service" },
            { to: "/privacy", label: "Privacy Policy" },
            { to: "/npp", label: "Notice of Privacy Practices" },
            { to: "/faq", label: "FAQ" },
            { to: "/contact", label: "Contact" }].
            map((link) =>
            <Link key={link.to} to={link.to} className="font-body text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">
                {link.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;