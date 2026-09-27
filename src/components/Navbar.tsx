import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRY_MD_COLOR } from "@/brand/tokens";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {setIsOpen(false);}, [location]);

  const links = [
    { to: "/#how-it-works", label: "How It Works" },
    { to: "/#treatments", label: "Treatments" },
    { to: "/dashboard", label: "Patient Portal" },
    { to: "/about", label: "About" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-navy/90 backdrop-blur-md" : "bg-navy"}`}>
      <div className="section-container flex items-center justify-between h-16 px-4 md:px-8">
        <Link to="/" className="font-display text-primary-foreground font-semibold text-2xl">
          Spry<span style={{ color: SPRY_MD_COLOR }}>MD</span>.AI
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="font-body text-primary-foreground/80 text-sm hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/?auth=1&returnTo=refills" className="text-primary-foreground/80 hover:text-white text-xs font-semibold px-3 py-2 transition-colors">
            Quick Refills
          </Link>
          <Link to="/quiz" className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-xs font-semibold font-body hover:bg-primaryDark transition-all duration-200">
            Start Medical Intake
          </Link>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-primary-foreground p-2" aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-navy overflow-hidden">
          
            <div className="px-4 pb-6 pt-2 flex flex-col gap-4">
              {links.map((link) =>
            <Link key={link.to} to={link.to} className="font-body text-primary-foreground/80 text-base py-2 hover:text-primary-foreground transition-colors">
                  {link.label}
                </Link>
            )}
              <Link to="/quiz" className="btn-primary text-center mt-2">
                Start Your Visit
              </Link>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

};

export default Navbar;