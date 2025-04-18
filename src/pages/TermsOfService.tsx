// src/pages/TermsOfService.tsx

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout'; // Adjust path if needed
import { motion } from 'framer-motion';
import { FileText, Shield } from 'lucide-react'; // Icons
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

const TermsOfService = () => {
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
            <FileText size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-slate-800">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: {lastUpdatedDate}
          </p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <strong className="font-semibold">Disclaimer:</strong> This is a template document and not legal advice. Consult a legal professional to draft terms appropriate for your service and ensure compliance with applicable laws.
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Password Haven website and Password Strength Analyzer tool (the "Service") operated by [Your Company/Individual Name] ("us", "we", or "our").
          </p>
          <p>
            Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">1. Use of the Service</h2>
            <p className="mb-3">
              Password Haven grants you a non-exclusive, non-transferable, revocable license to use the Service strictly in accordance with these Terms.
            </p>
            <p className="mb-2 font-medium">You agree not to use the Service:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate Password Haven, a Password Haven employee, another user, or any other person or entity.</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm or offend Password Haven or users of the Service or expose them to liability.</li>
              <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
              <li>To attack the Service via a denial-of-service attack or a distributed denial-of-service attack.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">2. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content provided by users, if any), features, and functionality are and will remain the exclusive property of [Your Company/Individual Name] and its licensors. The Service is protected by copyright, trademark, and other laws of both [Your Country] and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of [Your Company/Individual Name].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">3. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the operation of the Service or the information, content, materials, or products included therein. You expressly agree that your use of the Service is at your sole risk.
            </p>
            <p>
              Neither we nor any person associated with us makes any warranty or representation with respect to the completeness, security, reliability, quality, accuracy, or availability of the Service. Without limiting the foregoing, neither we nor anyone associated with us represents or warrants that the Service, its content, or any services or items obtained through the Service will be accurate, reliable, error-free, or uninterrupted, that defects will be corrected, that our site or the server that makes it available are free of viruses or other harmful components or that the Service or any services or items obtained through the Service will otherwise meet your needs or expectations.
            </p>
            <p>
              We hereby disclaim all warranties of any kind, whether express or implied, statutory, or otherwise, including but not limited to any warranties of merchantability, non-infringement, and fitness for particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">4. Limitation of Liability</h2>
            <p>
              IN NO EVENT WILL [YOUR COMPANY/INDIVIDUAL NAME], ITS AFFILIATES OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE SERVICE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE SERVICE OR SUCH OTHER WEBSITES OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE SERVICE OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT OR OTHERWISE, EVEN IF FORESEEABLE.
            </p>
            <p>
              THE FOREGOING DOES NOT AFFECT ANY LIABILITY WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">5. Indemnification</h2>
            <p>
              You agree to defend, indemnify and hold harmless [Your Company/Individual Name], its affiliates, licensors and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Service or your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">6. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of [Your State/Country, e.g., California, United States], without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">7. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least [e.g., 30] days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-slate-800 border-b pb-2">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: <br />
              {/* Add your contact email or link to a contact form */}
              [Your Contact Email Address or Link]
            </p>
          </section>
        </div>
      </motion.section>
    </Layout>
  );
};

export default TermsOfService;