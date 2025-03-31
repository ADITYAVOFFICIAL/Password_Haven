// src/pages/SecurityTips.tsx or src/components/SecurityTips.tsx
// Adjust the path based on your project structure

import { useState, useEffect, ReactNode } from "react";
import { Layout } from "@/components/Layout"; // Adjust path if needed
import {
  Shield,
  KeyRound,
  ShieldCheck,
  Lock,
  AlertTriangle,
  RefreshCw,
  FileText,
  Smartphone,
  Search,
  AtSign,
  HelpCircle,
  Link,
  Wallet,
  Eye,
  Layers,
  BrainCircuit,
  Computer,
  Fingerprint,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Adjust path if needed
import { useIsMobile } from "@/hooks/useIsMobile"; // Adjust path if needed

// --- Data Structure for Security Tips ---

const ENHANCED_SECURITY_TIPS = {
  passwords: {
    title: "Password Security",
    icon: <Lock size={20} className="text-inherit" />, // Use text-inherit for color control
    tips: [
      {
        title: "Use a Password Manager",
        description:
          "Password managers generate, store, and autofill strong, unique passwords for all your accounts. This prevents password reuse and makes it easier to use complex passwords. Most password managers also offer secure sharing, breach monitoring, and cross-device synchronization.",
        icon: "KeyRound",
        examples: [
          "1Password, Bitwarden, LastPass, and KeePass are popular options",
          "Many browsers now have built-in password managers, though dedicated solutions often provide better security",
        ],
      },
      {
        title: "Create Strong, Unique Passwords",
        description:
          "Use long passwords (12+ characters) with a mix of uppercase and lowercase letters, numbers, and symbols. Never reuse passwords across different sites or services, as a breach on one site could compromise all your accounts.",
        icon: "Lock",
        examples: [
          "Random passwords like 'X3f!pT8&vZ@q' are ideal for maximum security",
          "Passphrases like 'correct-horse-battery-staple-42!' are easier to remember",
        ],
      },
      {
        title: "Use Passphrases Instead of Passwords",
        description:
          "Consider using a series of random words with numbers and symbols which are easier to remember but harder to crack than shorter complex passwords. The length adds significant entropy while maintaining memorability.",
        icon: "FileText",
        examples: [
          "Example: 'grape-stapler-rhino-7!' (much stronger than 'P@ssw0rd1')",
          "Four random words plus a number and symbol can have over 100 bits of entropy",
        ],
      },
      {
        title: "Regularly Audit Your Passwords",
        description:
          "Periodically review your password security, especially for critical accounts. Look for weak, reused, or compromised passwords. Update passwords for important services at least annually, even if there's no known breach.",
        icon: "ListChecks",
        examples: [
          "Use your password manager's security audit feature",
          "Check breach monitoring services like 'Have I Been Pwned'",
        ],
      },
      {
        title: "Use Different Password Patterns for Different Security Levels",
        description:
          "Consider categorizing your accounts by importance and using different password strategies. Critical accounts (email, banking, password manager) should have the strongest possible passwords, while less important accounts can use simpler (but still strong) passwords.",
        icon: "Layers",
        examples: [
          "Critical: 20+ random characters with maximum complexity",
          "Important: 16+ character passphrases with symbols",
          "Standard: 12+ character unique passwords",
        ],
      },
    ],
  },
  authentication: {
    title: "Authentication Methods",
    icon: <Fingerprint size={20} className="text-inherit" />,
    tips: [
      {
        title: "Enable Two-Factor Authentication (2FA)",
        description:
          "Add an extra layer of security by enabling 2FA on all accounts that support it. Even if someone gets your password, they won't be able to access your account without the second factor. Authenticator apps are more secure than SMS-based 2FA.",
        icon: "ShieldCheck",
        examples: [
          "Authenticator apps: Google Authenticator, Microsoft Authenticator, Authy",
          "Hardware security keys like YubiKey offer the strongest protection",
          "Biometric factors (fingerprint, face recognition) when available",
        ],
      },
      {
        title: "Use Biometric Authentication When Available",
        description:
          "Modern devices offer fingerprint, face, or iris recognition as authentication methods. These are generally more convenient and secure than passwords for device access, though they should be combined with a strong password or PIN as backup.",
        icon: "Fingerprint",
        examples: [
          "Use Touch ID/Face ID for phones and laptops",
          "Enable Windows Hello or macOS Touch ID",
          "Remember that biometrics still need a password backup",
        ],
      },
      {
        title: "Implement Risk-Based Authentication",
        description:
          "When setting up security for business systems, consider risk-based authentication that adapts to the user's behavior, location, and device. This provides better security while reducing friction for legitimate access.",
        icon: "BrainCircuit",
        examples: [
          "Requiring additional verification for unusual locations or new devices",
          "Using single sign-on (SSO) solutions for enterprise systems",
          "Implementing adaptive authentication based on risk profiles",
        ],
      },
    ],
  },
  monitoring: {
    title: "Security Monitoring",
    icon: <Eye size={20} className="text-inherit" />,
    tips: [
      {
        title: "Regularly Check for Data Breaches",
        description:
          "Regularly check services like 'Have I Been Pwned' to see if your email has been involved in a data breach, and change passwords for affected accounts immediately. Many password managers now include breach monitoring features as well.",
        icon: "Search",
        examples: [
          "Set up breach alerts for your email addresses",
          "Check quarterly for any new breaches affecting your accounts",
          "Check if family members' accounts have been compromised too",
        ],
      },
      {
        title: "Monitor Account Activity",
        description:
          "Regularly review login activity, recent sessions, and connected applications for your important accounts. Many services provide activity logs that can help you spot unauthorized access or suspicious behavior.",
        icon: "Eye",
        examples: [
          "Review Google's security dashboard and recent activity",
          "Check Facebook's 'Where You're Logged In' section",
          "Monitor bank and credit card transactions regularly",
        ],
      },
      {
        title: "Use Identity Theft Protection Services",
        description:
          "Consider using identity theft protection services that monitor credit reports, dark web mentions of your personal information, and unauthorized use of your identity. These services often provide insurance and recovery assistance if your identity is stolen.",
        icon: "Shield",
        examples: [
          "Services like LifeLock, Identity Guard, or IdentityForce",
          "Credit monitoring through major credit bureaus",
          "Financial institutions often offer some form of identity monitoring",
        ],
      },
    ],
  },
  devices: {
    title: "Device Security",
    icon: <Computer size={20} className="text-inherit" />,
    tips: [
      {
        title: "Keep Your Devices Secure",
        description:
          "Keep your operating system, browsers, and apps updated. Use antivirus software and firewalls to protect against malware that could steal your passwords. Enable disk encryption on all devices to protect data if they're lost or stolen.",
        icon: "Smartphone",
        examples: [
          "Enable automatic updates for all software",
          "Use disk encryption: BitLocker (Windows), FileVault (Mac), or built-in encryption (mobile)",
          "Never leave devices unlocked when unattended",
        ],
      },
      {
        title: "Secure Your Home Network",
        description:
          "Protect your home WiFi with a strong password and WPA3 encryption if available. Change default router credentials, enable automatic updates, and consider setting up a guest network for visitors and IoT devices.",
        icon: "Computer",
        examples: [
          "Use a unique, strong password for your WiFi network",
          "Update router firmware regularly",
          "Consider using a VPN for additional privacy",
        ],
      },
      {
        title: "Be Cautious with Public WiFi",
        description:
          "Avoid accessing sensitive accounts or entering passwords when connected to public WiFi networks. If you must use public WiFi, connect through a VPN to encrypt your traffic and protect your data from snoopers.",
        icon: "AlertTriangle",
        examples: [
          "Use a reputable VPN service when on public networks",
          "Avoid banking or shopping on public WiFi without a VPN",
          "Disable auto-connect to unknown WiFi networks",
        ],
      },
    ],
  },
  awareness: {
    title: "Security Awareness",
    icon: <BrainCircuit size={20} className="text-inherit" />,
    tips: [
      {
        title: "Be Wary of Phishing Attempts",
        description:
          "Be suspicious of unexpected emails, messages, or calls asking for your password or personal information. Legitimate companies won't ask for your password. Check email sender addresses carefully and hover over links before clicking. When in doubt, go directly to the website by typing the URL.",
        icon: "AlertTriangle",
        examples: [
          "Look for spelling errors or unusual urgency in messages",
          "Verify requests through official channels or by contacting the company directly",
          "Never provide passwords or sensitive information in response to emails",
        ],
      },
      {
        title: "Use Unique Email Addresses",
        description:
          "Consider using different email addresses or aliases for different types of accounts to limit damage if one account is compromised. This also helps identify which service leaked your email if you start receiving spam.",
        icon: "AtSign",
        examples: [
          "Use email aliases through services like Gmail (+ symbol) or outlook.com",
          "Consider a separate email for financial accounts",
          "Use disposable email addresses for one-time registrations",
        ],
      },
      {
        title: "Be Careful with Security Questions",
        description:
          "Treat security questions like secondary passwords. Consider using fictional answers that only you would know, as factual answers might be discoverable online. Store these answers in your password manager.",
        icon: "HelpCircle",
        examples: [
          "Use answers unrelated to the question but memorable to you",
          "Avoid information that could be found on social media",
          "Store security question answers in your password manager",
        ],
      },
      {
        title: "Practice Safe Social Media",
        description:
          "Be mindful of the personal information you share online that could be used to guess passwords or answer security questions. Configure privacy settings carefully and periodically review who can see your information.",
        icon: "Link",
        examples: [
          "Avoid sharing birthdays, addresses, phone numbers publicly",
          "Don't post about upcoming travel until after you return",
          "Regularly review tagged photos and posts",
        ],
      },
    ],
  },
  recovery: {
    title: "Backup & Recovery",
    icon: <RefreshCw size={20} className="text-inherit" />,
    tips: [
      {
        title: "Prepare for Account Recovery",
        description:
          "Set up recovery methods for your important accounts and keep them updated. This includes recovery email addresses, phone numbers, and backup codes. Store backup codes securely in your password manager or printed in a safe location.",
        icon: "RefreshCw",
        examples: [
          "Download and securely store backup/recovery codes for crucial accounts",
          "Keep recovery email addresses and phone numbers current",
          "Consider setting up trusted contacts for account recovery",
        ],
      },
      {
        title: "Regularly Update Your Passwords",
        description:
          "Change your passwords regularly, especially for critical accounts like email and banking. Always change passwords immediately after a service announces a data breach, or if you suspect your account has been compromised.",
        icon: "RefreshCw",
        examples: [
          "Change passwords immediately if you suspect a breach",
          "Rotate passwords for critical accounts annually",
          "Use your password manager's password changer feature if available",
        ],
      },
      {
        title: "Protect Your Financial Accounts",
        description:
          "Add extra security to financial accounts by enabling alerts for transactions, using dedicated security tools offered by your bank, and considering a credit freeze to prevent identity theft.",
        icon: "Wallet",
        examples: [
          "Enable transaction alerts for unusual activity",
          "Consider a credit freeze if you're not applying for new credit",
          "Use virtual card numbers for online shopping when available",
        ],
      },
    ],
  },
};

// Define type for Tip structure (optional but good practice)
interface SecurityTip {
    title: string;
    description: string;
    icon: string; // Name of the icon component
    examples?: string[];
}

// Define type for Category structure (optional but good practice)
interface SecurityCategory {
    title: string;
    icon: ReactNode;
    tips: SecurityTip[];
}

// --- Main Component ---

const SecurityTips = () => {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("passwords");
  const isMobile = useIsMobile(); // Hook returns true, false, or undefined initially

  useEffect(() => {
    // Component did mount - useful for entry animations
    setMounted(true);
  }, []);

  // --- Helper Function to Get Icon Component ---
  const getIcon = (iconName: string): ReactNode => {
    const icons: Record<string, ReactNode> = {
      KeyRound: <KeyRound className="h-6 w-6 text-primary" />,
      ShieldCheck: <ShieldCheck className="h-6 w-6 text-primary" />,
      Lock: <Lock className="h-6 w-6 text-primary" />,
      AlertTriangle: <AlertTriangle className="h-6 w-6 text-primary" />,
      RefreshCw: <RefreshCw className="h-6 w-6 text-primary" />,
      FileText: <FileText className="h-6 w-6 text-primary" />,
      Smartphone: <Smartphone className="h-6 w-6 text-primary" />,
      Search: <Search className="h-6 w-6 text-primary" />,
      AtSign: <AtSign className="h-6 w-6 text-primary" />,
      HelpCircle: <HelpCircle className="h-6 w-6 text-primary" />,
      Link: <Link className="h-6 w-6 text-primary" />,
      Wallet: <Wallet className="h-6 w-6 text-primary" />,
      Eye: <Eye className="h-6 w-6 text-primary" />,
      Layers: <Layers className="h-6 w-6 text-primary" />,
      BrainCircuit: <BrainCircuit className="h-6 w-6 text-primary" />,
      Computer: <Computer className="h-6 w-6 text-primary" />,
      Fingerprint: <Fingerprint className="h-6 w-6 text-primary" />,
      ListChecks: <ListChecks className="h-6 w-6 text-primary" />,
      Shield: <Shield className="h-6 w-6 text-primary" />, // Default/fallback
    };

    return icons[iconName] || <Shield className="h-6 w-6 text-primary" />; // Return Shield as a fallback
  };

  // --- Reusable Tip Card Component ---
  const TipCard = ({ tip, index }: { tip: SecurityTip; index: number }) => (
    <div
      key={tip.title + index} // Use a more stable key if possible
      className={cn(
        "bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl p-5 shadow-sm flex flex-col", // Added flex flex-col
        "hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]",
        mounted
          ? `opacity-100 transform translate-y-0 delay-${Math.min(
              index * 100,
              500 // Cap delay for better perceived performance
            )}`
          : "opacity-0 transform translate-y-4"
      )}
      style={{ transitionProperty: 'opacity, transform, box-shadow' }} // Ensure transform transitions
    >
      <div className="mb-3 p-2 rounded-full bg-primary/10 w-fit text-primary shrink-0">
        {getIcon(tip.icon)}
      </div>
      <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
      <p className="text-muted-foreground text-sm mb-4 flex-grow"> {/* Added flex-grow */}
        {tip.description}
      </p>

      {tip.examples && tip.examples.length > 0 && (
        <div className="mt-auto bg-slate-50/80 rounded-lg p-3"> {/* Added mt-auto */}
          <p className="text-xs font-medium text-slate-700 mb-1.5">Examples:</p> {/* Adjusted spacing */}
          <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
            {tip.examples.map((example, i) => (
              <li key={i}>{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // --- Reusable Category Button Component ---
  const CategoryButton = ({
    categoryKey,
    category,
  }: {
    categoryKey: string;
    category: SecurityCategory;
  }) => (
    <button
      key={categoryKey}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors duration-150", // Adjusted gap and duration
        activeCategory === categoryKey
          ? "bg-primary/10 text-primary font-medium" // Active state styles
          : "hover:bg-slate-100/80 text-slate-700" // Hover state styles
      )}
      onClick={() => setActiveCategory(categoryKey)}
    >
      <span className={cn(activeCategory === categoryKey ? "text-primary" : "text-slate-500")}>
        {category.icon}
      </span>
      <span>{category.title}</span>
    </button>
  );

  // --- Get Currently Selected Category Data ---
  const currentCategoryData =
    ENHANCED_SECURITY_TIPS[
      activeCategory as keyof typeof ENHANCED_SECURITY_TIPS
    ];

  // --- Render Logic ---
  return (
    <Layout>
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Page Header */}
        <div
          className={cn(
            "text-center max-w-2xl mx-auto mb-8 md:mb-12 transition-all duration-700 ease-out", // Adjusted duration and easing
            mounted
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform -translate-y-6" // Slightly adjusted initial offset
          )}
        >
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <Shield size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Security Tips & Best Practices
          </h1>
          <p className="text-lg text-muted-foreground">
            Essential guidance to help you keep your online accounts secure and
            protect your digital identity.
          </p>
        </div>

        {/* Main Content Area: Conditional Layout based on screen size */}
        {isMobile === undefined ? (
          // Loading state or placeholder during initial render / SSR
          <div className="text-center py-16 text-muted-foreground">
            Loading Security Tips...
          </div>
        ) : isMobile ? (
          // Mobile Layout: Vertical Buttons + Single Column Tips
          <div className="flex flex-col gap-6">
            {/* Vertical Category Buttons */}
            <div className="bg-white/30 rounded-xl border border-slate-200/50 p-3 backdrop-blur-sm">
              <div className="space-y-1.5">
                {Object.entries(ENHANCED_SECURITY_TIPS).map(
                  ([key, category]) => (
                    <CategoryButton
                      key={key}
                      categoryKey={key}
                      category={category as SecurityCategory} // Type assertion
                    />
                  )
                )}
              </div>
            </div>

            {/* Content Area for Selected Category */}
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold px-1"> {/* Added padding */}
                {currentCategoryData.title}
              </h2>
              <div className="grid grid-cols-1 gap-5">
                {currentCategoryData.tips.map((tip, index) => (
                  <TipCard key={index} tip={tip} index={index} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Desktop Layout: Sticky Sidebar + Multi-Column Tips
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8"> {/* Added larger gap */}
            {/* Desktop Sticky Sidebar */}
            <div className="md:col-span-1"> {/* Wrap sidebar for sticky positioning */}
              <div className="sticky top-24 bg-white/30 rounded-xl border border-slate-200/50 p-3 backdrop-blur-sm"> {/* Adjust top offset as needed */}
                <div className="space-y-1.5">
                  {Object.entries(ENHANCED_SECURITY_TIPS).map(
                    ([key, category]) => (
                      <CategoryButton
                        key={key}
                        categoryKey={key}
                        category={category as SecurityCategory} // Type assertion
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Content Area */}
            <div className="md:col-span-3 space-y-5">
              <h2 className="text-2xl font-semibold mb-4 px-1"> {/* Added padding */}
                {currentCategoryData.title}
              </h2>
              {/* Display tips in 2 columns on desktop */}
              <div className="grid gap-5 md:grid-cols-2">
                {currentCategoryData.tips.map((tip, index) => (
                  <TipCard key={index} tip={tip} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Research/Additional Info Section */}
        <div className="mt-16 bg-slate-50/80 rounded-xl p-6 md:p-8 border border-slate-200/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-slate-800"> {/* Adjusted font weight/color */}
            Research-Based Password Security Insights
          </h2>
          <div className="space-y-4 text-muted-foreground text-sm md:text-base"> {/* Adjusted font size */}
            <p>
              Recent studies indicate that a significant portion of passwords used in the real world remain vulnerable. Research suggests that{" "}
              <strong>~59% of common passwords can be cracked in less than an hour</strong>{" "}
              using readily available hardware and intelligent guessing techniques, emphasizing the need for robust password practices.
            </p>
            <p>The typical distribution of cracking times highlights the risks:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Approximately <strong>45%</strong> are compromised almost instantly (under a minute).
              </li>
              <li>
                An additional <strong>14%</strong> fall within the first hour of attack.
              </li>
              <li>
                A concerningly small fraction, around <strong>23%</strong>, demonstrate resilience lasting over a year against standard cracking attempts.
              </li>
            </ul>
            <blockquote className="text-slate-700 border-l-4 border-primary/40 pl-4 py-2 bg-primary/5 rounded-r-md italic my-5"> {/* Added margin */}
              "Human perceptions of password complexity often misalign with computational reality. Patterns and common substitutions (like '@' for 'a') are easily bypassed by modern password-cracking algorithms, offering minimal real-world security gains."
              <span className="block text-xs text-slate-500 mt-2">- Security Research Findings</span> {/* Optional attribution */}
            </blockquote>
            <p>
              Cybersecurity is a dynamic landscape. Staying informed about emerging threats and evolving best practices is crucial. Always prioritize the security layers protecting your most sensitive accounts and data.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SecurityTips;