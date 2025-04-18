// src/components/ui/Footer.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Linkedin, Twitter } from 'lucide-react'; // Added potential social icons
import { cn } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Define footer navigation links (can be adjusted)
  const footerNav = [
    {
      title: "Navigate",
      links: [
        { label: "Home", href: "/" },
        { label: "Analyzer", href: "/password" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Security Tips", href: "/securitytips" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        // IMPORTANT: Create actual pages/routes for these if they don't exist
        { label: "Privacy Policy", href: "/privacy" }, // Example placeholder link
        { label: "Terms of Service", href: "/terms" },   // Example placeholder link
      ],
    },
  ];

  // Optional: Add social links if relevant
  const socialLinks = [
    // { label: "GitHub", href: "#", icon: <Github className="h-5 w-5" /> },
    // { label: "LinkedIn", href: "#", icon: <Linkedin className="h-5 w-5" /> },
    // { label: "Twitter", href: "#", icon: <Twitter className="h-5 w-5" /> },
  ];

  return (
    <footer className="bg-white border-t border-slate-200/60 mt-16 md:mt-24"> {/* Added top margin for spacing */}
      <div className="container mx-auto px-4 py-10 md:py-16"> {/* Increased padding */}

        {/* Top Section: Logo/Brand + Links */}
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-8 mb-10">

          {/* Left Side: Brand Info */}
          <div className="flex-shrink-0 md:max-w-xs text-center md:text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 mb-3 transition-opacity hover:opacity-80 justify-center md:justify-start"
            >
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-slate-800">Password Haven</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Analyze your password strength instantly and securely. Built with privacy as a top priority.
            </p>
          </div>

          {/* Right Side: Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-8 sm:gap-12 lg:gap-16">
            {footerNav.map((section) => (
              <div key={section.title} className="text-center sm:text-left">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider"> {/* Styling for section titles */}
                  {section.title}
                </h3>
                <ul className="space-y-2.5"> {/* Increased spacing */}
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright & Social Links */}
        <div className="border-t border-slate-200/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {currentYear} Password Haven. All Rights Reserved.
          </p>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}