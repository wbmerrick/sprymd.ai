import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { SPRY_MD_COLOR } from "@/brand/tokens";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {setIsOpen(false);}, [location]);

  // Anchors match the landing page section ids (SpryApp scrolls to them once loaded).
  const links = [
  { to: "/#how", label: "How It Works" },
  { to: "/#landing-conditions", label: "Treatments" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" }];


  return (
    <nav aria-label="Primary" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-navy/90 backdrop-blur-md" : "bg-navy"}`}>
      <div className="section-container flex items-center justify-between h-16 px-4 md:px-8">
        <Link to="/" className="font-display text-primary-foreground font-semibold text-2xl">
          Spry<span style={{ color: SPRY_MD_COLOR }}>MD</span>.AI
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) =>
          <Link key={link.to} to={link.to} className="font-body text-primary-foreground/80 text-sm hover:text-primary-foreground transition-colors">
              {link.label}
            </Link>
          )}
        </div>

        <div className="hidden md:block">
          <Link to="/#landing-conditions" className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold font-body hover:bg-blue-light transition-all duration-200">
            Start Your Visit
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-primary-foreground p-2"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="primary-mobile-menu"
        >
          {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Collapsible mobile menu: CSS grid-row transition, no animation library needed. */}
      <div
        id="primary-mobile-menu"
        aria-hidden={!isOpen}
        className={`md:hidden grid bg-navy transition-[grid-template-rows,opacity,visibility] duration-300 ease-out motion-reduce:transition-none ${
        isOpen ? "grid-rows-[1fr] opacity-100 visible" : "grid-rows-[0fr] opacity-0 invisible"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-6 pt-2 flex flex-col gap-4">
            {links.map((link) =>
            <Link key={link.to} to={link.to} tabIndex={isOpen ? 0 : -1} className="font-body text-primary-foreground/80 text-base py-2 hover:text-primary-foreground transition-colors">
                {link.label}
              </Link>
            )}
            <Link to="/#landing-conditions" tabIndex={isOpen ? 0 : -1} className="btn-primary text-center mt-2">
              Start Your Visit
            </Link>
          </div>
        </div>
      </div>
    </nav>);

};

export default Navbar;
