// src/pages/PrivacyPolicy.tsx

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout'; // Adjust path if needed
import { motion } from 'framer-motion';
import { Shield, FileText } from 'lucide-react'; // Icons
import { cn } from '@/lib/utils'; // Utility function

// Animation Variants (optional, for consistency)
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const PrivacyPolicy = () => {
  const [mounted, setMounted] = useState(false);
  const lastUpdatedDate = "April 3, 2025"; // <-- CHANGE THIS DATE

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0); // Scroll to top on mount
  }, []);

  return (
    <Layout>
      <motion.section
        className="container mx-auto px-4 py-8 md:py-12 max-w-3xl" // Constrained width for readability
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        variants={pageVariants}
      >
        {/* Page Header */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <Shield size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-slate-800">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: {lastUpdatedDate}
          </p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <strong className="font-semibold">Disclaimer:</strong> This is a template policy and not legal advice. Consult a legal professional to ensure compliance with applicable laws and regulations for your specific situation.
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            Welcome to Password Haven ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Password Strength Analyzer tool and website (collectively, the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">1. Information We Collect</h2>
            <p className="mb-3">
              We primarily designed our Service to operate without collecting personally identifiable information (PII). The core functionality of analyzing password strength happens locally within your browser.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>
                <strong>Passwords You Enter:</strong> Passwords entered into the analyzer tool are processed **locally in your browser** for analysis. They are **never** stored, logged, or transmitted to our servers or any third-party servers in their original form.
              </li>
              <li>
                <strong>Breach Checks (k-Anonymity):</strong> When checking against known data breaches (e.g., using Have I Been Pwned's Pwned Passwords API), we use a technique called k-anonymity. This involves sending only a small, non-identifiable part of a hashed version of your password, not the password itself. This allows us to check for breaches without exposing your actual password.
              </li>
               <li>
                <strong>AI Analysis (Optional):</strong> If you utilize AI-powered suggestions (e.g., via Google Gemini), the password and related context might be sent securely to the AI provider's API for processing. We configure these requests, where possible, to prevent the provider from logging or storing your input data. However, the provider's own privacy policy also applies.
              </li>
              <li>
                <strong>Usage Data (Analytics):</strong> We may collect anonymous usage data through standard analytics tools (like Google Analytics, Plausible, etc.) to understand how users interact with our Service. This may include information like browser type, operating system, pages visited, time spent, and general location (country/city level). This data is aggregated and cannot be used to identify individual users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">2. How We Use Your Information</h2>
            <p className="mb-3">
              Since we collect minimal PII, our use is limited:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>
                <strong>To Provide and Operate the Service:</strong> Processing passwords locally to provide strength analysis and suggestions.
              </li>
              <li>
                <strong>To Improve the Service:</strong> Analyzing anonymous usage data helps us understand user needs, identify areas for improvement, and enhance the user experience.
              </li>
              <li>
                <strong>To Ensure Security:</strong> Monitoring for potential security threats or vulnerabilities (primarily through aggregated, anonymous data).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">3. Disclosure of Your Information</h2>
            <p>
              We do not sell, trade, rent, or otherwise share your personal information (as we collect virtually none) with third parties for marketing purposes. We may share information in the following limited circumstances:
            </p>
             <ul className="list-disc pl-6 space-y-1 text-sm mt-3">
                <li>
                    <strong>With Service Providers (AI):</strong> As mentioned, interaction with AI features involves sending data to the AI provider under secure conditions and subject to their privacy policies.
                </li>
                <li>
                    <strong>By Law or to Protect Rights:</strong> If required by law, subpoena, or other legal process, or if we believe in good faith that disclosure is necessary to protect our rights, property, or safety, or the rights, property, or safety of others.
                </li>
                 <li>
                    <strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company, aggregated anonymous data might be transferred.
                </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">4. Data Security</h2>
            <p>
              We use administrative, technical, and physical security measures designed to protect any information we handle. The primary security feature is that your sensitive password data is processed locally and not stored by us. While we have taken reasonable steps, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

           <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">5. Cookies and Tracking Technologies</h2>
            <p>
              We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Service to help customize the Service and improve your experience (e.g., for analytics). Most browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject cookies, but be aware that such action could affect the availability and functionality of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">6. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect personally identifiable information from children under 13. If we become aware that we have inadvertently collected PII from a child under 13, we will take steps to delete such information from our records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">8. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: <br />
              {/* Add your contact email or link to a contact form */}
              [Your Contact Email Address or Link]
            </p>
          </section>
        </div>
      </motion.section>
    </Layout>
  );
};

export default PrivacyPolicy;