// src/pages/Index.tsx (or Home.tsx)
import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection"; // Adjust path if needed
import { FeaturesSection } from "@/components/FeaturesSection"; // Adjust path if needed
import { WhyUsSection } from "@/components/WhyUsSection"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Why Us Section (Optional) */}
      <WhyUsSection />

      {/* Final Call to Action Section */}
      <section className="py-16 md:py-24 text-center bg-gradient-to-b from-slate-50/70 to-blue-50/50">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Ready to Enhance Your Security?
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Take the first step towards stronger passwords and better online
            protection. Analyze your password now or explore our resources.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button size="lg" asChild>
              <Link to="/password">
                Analyze Password <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/securitytips">
                <BookOpen className="mr-2 h-5 w-5" /> Learn Security Tips
              </Link>
            </Button>
             <Button size="lg" variant="ghost" asChild>
              <Link to="/faq">
                <HelpCircle className="mr-2 h-5 w-5" /> View FAQ
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;