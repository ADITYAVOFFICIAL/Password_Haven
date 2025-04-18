import React, { useState, useEffect } from "react"; // Import React explicitly if needed
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, Lock, HelpCircle, BookOpen } from "lucide-react"; // Removed unused Settings icon
import { cn } from "@/lib/utils"; // Assuming utils.ts exists in lib folder
import { useIsMobile } from "@/hooks/useIsMobile"; // Assuming useIsMobile hook exists
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink, // Import the Link component from Radix
  NavigationMenuList,
  // NavigationMenuTrigger, // Not used directly for simple links
  // NavigationMenuContent, // Not used directly for simple links
  navigationMenuTriggerStyle // Import the style function
} from "@/components/ui/navigation-menu"; // Assuming navigation-menu is in components/ui
import { Button } from "@/components/ui/button"; // Assuming button is in components/ui

// Define the type for navigation items for better type safety
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactElement; // Use ReactElement for icons
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: <Shield className="w-4 h-4" /> },
  { href: "/password", label: "Password Analyzer", icon: <Lock className="w-4 h-4" /> },
  { href: "/securitytips", label: "Security Tips", icon: <BookOpen className="w-4 h-4" /> },
  { href: "/faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
];

// Animation variants for mobile menu
const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeIn" }
  }
};

export function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    // Clean up the event listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Dependency on location.pathname


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function specifically for closing, used by links
  const closeMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm"
          : "bg-white/60 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 py-3 md:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            onClick={closeMobileMenu} // Close menu if logo is clicked on mobile
          >
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Password Haven</h1>
          </Link>

          {/* Desktop Navigation - CORRECTED */}
          {!isMobile && (
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    {/* Use NavigationMenuLink with asChild prop */}
                    <NavigationMenuLink asChild active={location.pathname === item.href}>
                      {/* The react-router-dom Link is now the child */}
                      <Link
                        to={item.href}
                        className={cn(
                          navigationMenuTriggerStyle(), // Apply base styles
                          "flex items-center gap-2 px-4", // Custom layout styles
                          // Apply active styles based on Radix's active state (passed via prop) or pathname
                          location.pathname === item.href
                            ? "bg-accent/50 text-accent-foreground font-medium"
                            : "" // Radix handles hover/focus/active states via data attributes
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
            className={cn(
              "absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-200/50 md:hidden",
              "z-20" // Ensure it's above content but below the sticky header potentially
            )}
          >
            <nav className="flex flex-col divide-y divide-slate-100/70">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-5 py-4 text-base transition-colors",
                    location.pathname === item.href
                      ? "text-primary font-medium bg-primary/5"
                      : "text-foreground hover:bg-slate-50"
                  )}
                  onClick={closeMobileMenu} // Close menu when a link is clicked
                >
                  <span className={location.pathname === item.href ? "text-primary" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Helper hook (assuming it exists elsewhere, e.g., src/hooks/useIsMobile.ts)
// Example implementation:
/*
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768): boolean { // Default to md breakpoint
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
*/

// Utility function (assuming it exists elsewhere, e.g., src/lib/utils.ts)
// Example implementation using clsx and tailwind-merge:
/*
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
*/