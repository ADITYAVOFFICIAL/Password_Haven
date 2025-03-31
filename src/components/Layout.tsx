// src/components/Layout.tsx
import { ReactNode, useState } from "react";
import { Shield, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile"; // Adjust import path if needed
import { cn } from "@/lib/utils"; // Assuming you have this utility from shadcn/ui

interface LayoutProps {
  children: ReactNode;
}

// Animation variants for the mobile menu
const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    y: -20, // Start slightly above
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/securitytips", label: "Security Tips" }, // Ensure route exists or use '#'
  { href: "/faq", label: "FAQ" }, // Ensure route exists or use '#'
];

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* === Header === */}
      <header className="border-b border-slate-200/50 backdrop-blur-sm bg-white/70 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo/Title */}
          <a href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-medium">Password Strength Analyzer</h1>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* === Mobile Menu Overlay === */}
        <AnimatePresence>
          {isMobile && isMobileMenuOpen && (
            <motion.div
              key="mobile-menu" // Key is important for AnimatePresence
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileMenuVariants}
              className={cn(
                "absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-200/50 md:hidden", // top-full places it below the header
                "z-20" // Ensure it's below header (z-30) but above content
              )}
            >
              <nav className="flex flex-col px-4 py-4 gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu} // Close menu on link click
                    className="block text-base text-foreground hover:text-primary transition-colors py-2"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* === Main Content === */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* === Footer === */}
      <footer className="border-t border-slate-200/50 backdrop-blur-sm bg-white/70 py-6 mt-auto"> {/* mt-auto pushes footer down */}
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            This site doesn't store your passwords. All analysis happens locally
            in your browser.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Password Strength Analyzer
          </p>
        </div>
      </footer>
    </div>
  );
}