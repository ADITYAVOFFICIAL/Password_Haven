// src/components/FeaturesSection.tsx
import { FeatureCard } from "./FeatureCard"; // Use the adapted FeatureCard
import { Zap, BrainCircuit, ShieldOff, LockKeyhole, BarChartBig } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Zap className="h-7 w-7" />, // Slightly larger icon
    title: "Instant Real-time Feedback",
    description: "See your password strength score and analysis update instantly as you type.",
  },
  {
    icon: <BrainCircuit className="h-7 w-7" />,
    title: "AI-Powered Suggestions",
    description: "Receive intelligent recommendations to enhance your password's complexity and security.",
  },
  {
    icon: <ShieldOff className="h-7 w-7" />,
    title: "Breach & Pattern Checks",
    description: "Check if your password resembles those found in known data breaches (HIBP & patterns).",
  },
  {
    icon: <BarChartBig className="h-7 w-7" />,
    title: "Comprehensive Analysis",
    description: "Evaluate length, character types, entropy, common patterns, and estimated crack times.",
  },
  {
    icon: <LockKeyhole className="h-7 w-7" />,
    title: "Privacy First Design",
    description: "Your password is never stored or sent anywhere. All analysis happens locally in your browser.",
  },
    {
    icon: <BarChartBig className="h-7 w-7" />,
    title: "Detailed Crack Time Estimates",
    description: "Understand how long it might take various hardware setups to crack your password.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger animation of feature cards
      delayChildren: 0.2, // Small delay before starting children animations
    },
  },
};


export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50/70">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight">
          Why Use Our Analyzer?
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible" // Animate when section scrolls into view
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% is visible
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index} // Pass index for staggering
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}