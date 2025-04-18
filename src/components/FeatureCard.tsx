// src/components/FeatureCard.tsx
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  index?: number; // Optional index for staggered animation
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ // Accept index for delay
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1, // Stagger delay based on index
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};


export function FeatureCard({ icon, title, description, className, index }: FeatureCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl p-6 shadow-sm",
        "hover:shadow-lg transition-all duration-300 hover:-translate-y-1", // Subtle hover effect
        "flex flex-col items-center text-center", // Center content
        className
      )}
      custom={index} // Pass index to variants
      variants={cardVariants}
      // initial="hidden" // Let parent control initial/animate
      // animate="visible"
      // viewport={{ once: true, amount: 0.3 }} // Trigger animation when 30% visible
    >
      <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-slate-800">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}