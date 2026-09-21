import { useState, useEffect } from "react";

import { Link, useLocation } from "react-router-dom";

import { Menu, X } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { usePatientAuth } from "@/hooks/usePatientAuth";



const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  const { isAuthenticated, isLoading } = usePatientAuth();

  const isPortal = location.pathname.startsWith("/portal");



  useEffect(() => {

    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);



  useEffect(() => {setIsOpen(false);}, [location]);



  const links = [

  { to: "/#how-it-works", label: "How It Works" },

  { to: "/#services", label: "Services" },

  { to: "/about", label: "About" },

  { to: "/faq", label: "FAQ" },

  { to: "/contact", label: "Contact" }];





  return (

    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-navy/95 backdrop-blur-md shadow-lg" : "bg-navy"}`}>

      <div className="section-container flex items-center justify-between h-16 px-4 md:px-8">

        <Link to="/" className="font-display text-primary-foreground font-semibold text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded-sm">SpryMD
        </Link>



        <div className="hidden md:flex items-center gap-8">

          {!isPortal && links.map((link) =>

          <Link key={link.to} to={link.to} className="font-body text-primary-foreground/80 text-sm hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded-sm">

              {link.label}

            </Link>

          )}

          {!isLoading && (

            <Link

              to={isAuthenticated ? "/portal" : "/portal/login"}

              className="font-body text-primary-foreground/80 text-sm hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded-sm"

            >

              {isAuthenticated ? "My Care" : "Patient Login"}

            </Link>

          )}

        </div>



        <div className="hidden md:flex items-center gap-4">

          {!isPortal && (

            <Link to="/quiz" className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold font-body hover:bg-blue-light transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navy">

              Start Your Visit

            </Link>

          )}

        </div>



        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-primary-foreground p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-light rounded-sm" aria-label="Toggle menu">

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

          className="md:hidden bg-navy border-t border-primary-foreground/10 overflow-hidden">

          

            <div className="px-4 pb-6 pt-2 flex flex-col gap-4">

              {!isPortal && links.map((link) =>

            <Link key={link.to} to={link.to} className="font-body text-primary-foreground/80 text-base py-2 hover:text-primary-foreground transition-colors">

                  {link.label}

                </Link>

            )}

              {!isLoading && (

                <Link

                  to={isAuthenticated ? "/portal" : "/portal/login"}

                  className="font-body text-primary-foreground/80 text-base py-2 hover:text-primary-foreground transition-colors"

                >

                  {isAuthenticated ? "My Care" : "Patient Login"}

                </Link>

              )}

              {!isPortal && (

                <Link to="/quiz" className="btn-primary text-center mt-2">

                  Start Your Visit

                </Link>

              )}

            </div>

          </motion.div>

        }

      </AnimatePresence>

    </nav>);



};



export default Navbar;

