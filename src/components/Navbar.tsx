import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, Lock, HelpCircle, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

const navItems = [
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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
            onClick={closeMobileMenu}
          >
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Password Haven</h1>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link to={item.href}>
                      <NavigationMenuLink 
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "flex items-center gap-2 px-4",
                          location.pathname === item.href && "bg-accent/50 text-accent-foreground font-medium"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Mobile Button */}
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
              "z-20"
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
                  onClick={closeMobileMenu}
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