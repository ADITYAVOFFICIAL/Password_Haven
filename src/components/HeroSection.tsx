// src/components/HeroSection.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger animation of children
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export function HeroSection() {
  return (
    <motion.section
      className="text-center py-16 md:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary"
        variants={itemVariants}
      >
        <ShieldCheck size={32} />
      </motion.div>

      <motion.h1
        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 text-transparent bg-clip-text"
        variants={itemVariants}
      >
        Analyze Your Password Strength Instantly
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
        variants={itemVariants}
      >
        Get detailed insights into your password's security with our advanced
        analyzer. Understand vulnerabilities, receive AI-powered suggestions,
        and ensure your accounts are protected.
      </motion.p>

      <motion.div variants={itemVariants}>
        <Button size="lg" asChild>
          <Link to="/password">
            Analyze Your Password Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </motion.div>
    </motion.section>
  );
}