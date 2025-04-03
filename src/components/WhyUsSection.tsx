// src/components/WhyUsSection.tsx
import { CheckCircle, ShieldCheck, GraduationCap, Zap } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-primary" />,
    text: "Uncompromising Privacy: Your password stays on your device.",
  },
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    text: "Comprehensive & Fast Analysis: Get detailed results instantly.",
  },
  {
    icon: <GraduationCap className="h-5 w-5 text-primary" />,
    text: "Educational Insights: Learn *why* a password is weak or strong.",
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-primary" />,
    text: "Actionable Recommendations: Improve security with AI suggestions.",
  },
];

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function WhyUsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-tight">
          Built for Security and Understanding
        </h2>
        <motion.ul
          className="space-y-4"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {benefits.map((benefit) => (
            <motion.li
              key={benefit.text}
              className="flex items-start gap-3 p-4 bg-white/30 border border-slate-200/40 rounded-lg shadow-sm"
              variants={itemVariants}
            >
              <span className="mt-1 shrink-0">{benefit.icon}</span>
              <span className="text-base text-slate-700">{benefit.text}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}