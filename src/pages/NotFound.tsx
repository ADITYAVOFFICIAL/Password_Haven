// src/pages/NotFound.tsx (or wherever you place page components)

import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, HelpCircle } from 'lucide-react'; // Icons
import { Button } from '@/components/ui/button'; // Shadcn Button
import { cn } from '@/lib/utils'; // Utility function

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger animation of children
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const NotFound = () => {
  const location = useLocation();

  // Log the error for debugging purposes
  useEffect(() => {
    console.error(
      `404 Not Found: User attempted to access non-existent route: ${location.pathname}`
    );
  }, [location.pathname]);

  return (
    // Use the same gradient as Layout for consistency, ensure full height
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md text-center bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-xl shadow-lg p-8 md:p-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon */}
        <motion.div
          className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100/50 text-amber-500"
          variants={itemVariants}
        >
          <AlertTriangle size={32} strokeWidth={1.5} />
        </motion.div>

        {/* 404 Heading */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold text-slate-800 mb-3 tracking-tight"
          variants={itemVariants}
        >
          404
        </motion.h1>

        {/* Page Not Found Subheading */}
        <motion.h2
          className="text-xl md:text-2xl font-semibold text-slate-700 mb-5"
          variants={itemVariants}
        >
          Page Not Found
        </motion.h2>

        {/* Informative Text */}
        <motion.p
          className="text-base text-muted-foreground mb-8"
          variants={itemVariants}
        >
          Sorry, the page you were looking for doesn't exist or may have been moved. We couldn't find:
          <code className="block mt-2 bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-md text-sm font-mono break-all">
            {location.pathname}
          </code>
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-3"
          variants={itemVariants}
        >
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button size="lg" variant="ghost" asChild className="w-full sm:w-auto">
            <Link to="/faq">
              <HelpCircle className="mr-2 h-4 w-4" />
              View FAQ
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;