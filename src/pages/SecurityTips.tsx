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
  ShieldAlert,
  BookOpen, 
  Wand2,  
  Gauge,    
  Users,    
  Clock,    
  Zap,     
  Lightbulb,
  TrendingUp, 
  Info
} from "lucide-react";
import { cn } from "@/lib/utils"; // Adjust path if needed
import { useIsMobile } from "@/hooks/useIsMobile"; // Adjust path if needed

// --- Data Structure for Security Tips ---

const ENHANCED_SECURITY_TIPS: SecurityTipsData = {
  passwords: {
    title: "Password Creation & Management", // Renamed for clarity
    icon: <Lock size={20} className="text-inherit" />,
    tips: [
      {
        title: "Utilize a Reputable Password Manager", // Enhanced title
        description:
          "Password managers are essential tools. They securely generate, store complex passwords, and autofill them, eliminating the need to remember dozens of unique credentials and preventing the dangerous practice of password reuse. They act as an encrypted vault for your digital keys.",
        icon: "KeyRound",
        examples: [
          "Leading options: Bitwarden (Open Source), 1Password (User-Friendly), KeePassXC (Offline/Self-Hosted), Proton Pass (Privacy-Focused).",
          "Browser managers (Chrome, Firefox, Safari) are convenient but dedicated managers offer more features like secure notes, identity storage, and cross-platform syncing.",
          "Ensure your Master Password for the manager is extremely strong and unique.",
        ],
        importantNote: "Your password manager's master password is the key to everything; make it exceptionally strong (long passphrase recommended) and never reuse it."
      },
      {
        title: "Mandate Strong, Unique Credentials", // Enhanced title
        description:
          "Every account needs its own unique password. Aim for significant length (15+ characters ideally) and complexity (mix of upper/lowercase letters, numbers, symbols). Avoid dictionary words, common phrases, or predictable substitutions (like 'P@ssw0rd'). The primary defense against brute-force and dictionary attacks is length and randomness.",
        icon: "Lock",
        examples: [
          "Generated: '3k$Gv^8!p@zL#sQ7*bN', 'j9#rW&pZ@1sF!dK5'",
          "Passphrase: 'Vivid-Arctic-Jigsaw-Plummet-74@'",
          "Avoid: 'Password123', 'Admin!', 'CompanyName2024', 'qwerty!@#'.",
        ],
        importantNote: "Password reuse is one of the biggest risks. A breach on one site can compromise all others where the same password is used (credential stuffing)."
      },
      {
        title: "Embrace Long Passphrases", // Enhanced title
        description:
          "Instead of complex strings, consider using passphrases composed of 4-6 random, unrelated words. Length is key here. Adding numbers or symbols increases strength further. This method leverages entropy through length, often making them easier to remember (if needed) but very hard to crack.",
        icon: "FileText",
        examples: [
          "Method: Use diceware (rolling dice to pick words from a list) for true randomness.",
          "Example: 'staple-correct-battery-horse-!99' (classic XKCD reference, but use *random* words).",
          "Generated Example: 'Oceanic+Waffle?Lamp=Gravity6'",
          "Tools like EFF's Diceware list or online generators can help.",
        ],
      },
      {
        title: "Conduct Regular Password Audits", // Enhanced title
        description:
          "Periodically review the passwords stored in your manager. Identify and update weak, reused, very old, or potentially compromised passwords (flagged by breach monitoring). Prioritize critical accounts like email, banking, and the password manager itself.",
        icon: "ListChecks",
        examples: [
          "Use built-in audit tools in 1Password, Bitwarden, Dashlane, etc.",
          "Cross-reference flagged passwords with Have I Been Pwned (HIBP).",
          "Focus on accounts holding sensitive personal or financial data.",
          "Aim for an audit at least once or twice a year.",
        ],
      },
      {
        title: "Avoid Predictable Patterns & Personal Info", // New Tip
        description:
          "Humans tend towards patterns. Avoid sequences (abc, 123), keyboard walks (qwerty, asdfgh), common substitutions ('@' for 'a', '3' for 'e'), or appending years/numbers predictably. Never use personal information like birthdays, names (yours, family, pets), addresses, or common words related to your interests.",
        icon: "MessageSquareWarning", // New icon
        examples: [
          "Bad: 'MyDogFido19!', 'LiverpoolFan_2024', 'Summer23!', 'P@$$wOrdPlu$1'.",
          "Attackers specifically target these common human-generated patterns.",
          "True randomness from a generator is always superior.",
        ],
      },
      {
        title: "Tier Your Password Strategy", // Renamed from "Use Different Patterns"
        description:
          "Categorize accounts based on risk. Use your strongest, most unique passwords/passphrases for high-value targets (email, finance, password manager). Slightly less complex (but still strong and unique) passwords can be used for medium-risk accounts. Avoid weak passwords even for low-risk sites.",
        icon: "Layers",
        examples: [
          "Tier 1 (Critical): 25+ character generated password or 6+ word passphrase.",
          "Tier 2 (Important): 16+ character generated password or 4-5 word passphrase.",
          "Tier 3 (Standard): 12-15 character generated password.",
          "Never reuse passwords between tiers.",
        ],
      },
    ],
  },
  authentication: {
    title: "Multi-Factor Authentication (MFA)", // Renamed
    icon: <Fingerprint size={20} className="text-inherit" />,
    tips: [
      {
        title: "Enable MFA Everywhere Possible", // Enhanced title
        description:
          "Multi-Factor Authentication (MFA/2FA) adds a critical security layer. Even if your password is stolen, attackers need the second factor (something you have or something you are) to gain access. Prioritize MFA on email, financial, social media, and cloud storage accounts.",
        icon: "ShieldCheck",
        examples: [
          "Methods (Secure to Less Secure): Hardware Keys (YubiKey, Titan), Authenticator Apps (Authy, Google/Microsoft Authenticator - TOTP), Push Notifications, SMS/Email codes (vulnerable to SIM swapping/phishing).",
          "Always prefer app-based TOTP or hardware keys over SMS.",
          "Store backup codes securely (in password manager or offline).",
        ],
        importantNote: "SMS-based 2FA is better than nothing, but significantly less secure than app-based or hardware methods."
      },
      {
        title: "Understand and Use Passkeys", // New Tip
        description:
          "Passkeys are a newer, more secure alternative to passwords based on cryptographic key pairs (FIDO/WebAuthn standard). They replace passwords entirely for supported sites, offering phishing resistance and simpler logins using your device's biometrics or PIN. Adoption is growing.",
        icon: "UserCheck", // New icon
        examples: [
          "Managed by your device (phone, computer) or a hardware security key.",
          "Supported by Google, Apple, Microsoft, and growing number of websites.",
          "Often sync across devices via cloud accounts (e.g., iCloud Keychain, Google Password Manager).",
          "Can coexist with traditional passwords during transition.",
        ],
      },
      {
        title: "Leverage Biometrics Securely", // Renamed
        description:
          "Biometrics (fingerprint, face recognition) offer convenient device and app unlocking. While generally secure for this purpose, understand they primarily protect device access. They should always be backed by a strong PIN or password. Be aware of potential (though often difficult) bypass methods.",
        icon: "Fingerprint",
        examples: [
          "Use for unlocking phones, laptops, password managers.",
          "Ensure device has a strong fallback PIN/password.",
          "Consider potential risks like unlocking under duress or with high-quality fakes (rare).",
        ],
      },
      {
        title: "Be Aware of Risk-Based/Adaptive Authentication", // Renamed
        description:
          "Many services use adaptive authentication, analyzing login context (location, device, time, behavior) to assess risk. Unusual activity might trigger requests for additional verification (like MFA or security questions), even if the password is correct. This is largely invisible to users but enhances security.",
        icon: "BrainCircuit",
        examples: [
          "Login from a new country triggers an email verification.",
          "Multiple failed login attempts temporarily lock the account.",
          "Enterprises use this heavily with Single Sign-On (SSO) systems.",
        ],
      },
    ],
  },
  monitoring: {
    title: "Account & Identity Monitoring", // Renamed
    icon: <Eye size={20} className="text-inherit" />,
    tips: [
      {
        title: "Actively Monitor for Data Breaches", // Enhanced title
        description:
          "Use services like 'Have I Been Pwned' (HIBP) to check if your email addresses or specific passwords (via HIBP's password checker) have appeared in known breaches. Many password managers integrate this. If an account is breached, change the password immediately and enable MFA if not already active.",
        icon: "DatabaseZap", // Changed icon
        examples: [
          "Check HIBP regularly: haveibeenpwned.com",
          "Use Firefox Monitor or similar services.",
          "Enable breach alerts in your password manager (1Password Watchtower, Bitwarden Reports).",
          "Don't just check your primary email; check all associated emails.",
        ],
        importantNote: "Finding your email in a breach means you MUST change the password for that specific service and any other service where you reused that password."
      },
      {
        title: "Review Account Login & Security Activity", // Enhanced title
        description:
          "Periodically check the security sections of your critical accounts (email, social media, cloud services). Look for unrecognized login locations, devices, connected apps, or changes to security settings (like recovery email/phone). Report any suspicious activity immediately.",
        icon: "Eye",
        examples: [
          "Google: Security Checkup & Recent Security Activity.",
          "Microsoft: Recent Activity Page.",
          "Facebook/Instagram: Security and Login -> Where You're Logged In.",
          "Review apps granted access to your accounts (OAuth).",
        ],
      },
      {
        title: "Consider Identity Theft Monitoring (with caution)", // Enhanced title
        description:
          "Paid identity theft services monitor credit reports, dark web forums, and public records for your personal information. They can provide alerts and assistance. Evaluate the cost versus benefit; basic credit monitoring is often available for free or through financial institutions.",
        icon: "Shield",
        examples: [
          "Services: Aura, Identity Guard, LifeLock (evaluate features and cost).",
          "Free options: Credit Karma, bank-provided monitoring, annual free credit reports.",
          "A credit freeze can be a highly effective (and often free) preventative measure.",
        ],
      },
    ],
  },
  devices: {
    title: "Device & Network Security", // Renamed
    icon: <Computer size={20} className="text-inherit" />,
    tips: [
      {
        title: "Maintain Device Hygiene: Updates & Protection", // Enhanced title
        description:
          "Keep operating systems (Windows, macOS, iOS, Android), browsers, and all applications updated promptly. Updates patch security vulnerabilities exploited by malware. Use reputable antivirus/anti-malware software and enable firewalls. Secure devices with strong screen locks and short auto-lock timers.",
        icon: "Smartphone",
        examples: [
          "Enable automatic updates whenever possible.",
          "Use built-in security (Windows Defender, XProtect) or trusted third-party AV.",
          "Enable full-disk encryption (BitLocker, FileVault).",
          "Set screen lock timeout to 1-5 minutes.",
          "Review and limit app permissions regularly on mobile.",
        ],
      },
      {
        title: "Secure Your Home Network Router", // Enhanced title
        description:
          "Your router is the gateway to your network. Change the default admin username and password immediately. Use strong WPA3 (or WPA2-AES) encryption with a unique, long password for your WiFi. Keep router firmware updated. Disable WPS (WiFi Protected Setup) as it can be vulnerable. Consider segmenting networks (guest, IoT).",
        icon: "Computer",
        examples: [
          "Router Admin: Use a password manager to generate a strong password.",
          "WiFi Password: Treat it like any other critical password - long and unique.",
          "Check manufacturer's website for firmware updates.",
          "Create a separate Guest network for visitors.",
        ],
      },
      {
        title: "Exercise Extreme Caution on Public WiFi", // Enhanced title
        description:
          "Public WiFi networks (cafes, airports, hotels) are inherently insecure. Avoid logging into sensitive accounts (banking, email) or transmitting confidential data unless using a trusted VPN. Attackers can intercept traffic (Man-in-the-Middle attacks). Assume the network is hostile.",
        icon: "WifiOff", // Changed icon
        examples: [
          "Use a reputable paid VPN service (e.g., ProtonVPN, Mullvad, IVPN).",
          "Ensure websites use HTTPS (lock icon in browser), but VPN is still recommended.",
          "Turn off auto-connect to open WiFi networks on your devices.",
          "Use cellular data instead of public WiFi for sensitive tasks if possible.",
        ],
      },
      {
        title: "Enable Remote Wipe Capabilities", // New Tip
        description:
          "Configure remote lock and wipe features on your smartphones, tablets, and laptops (Find My iPhone/Mac, Google Find My Device, Windows Find My Device). This allows you to locate, lock, or erase your device if it's lost or stolen, protecting the data stored on it.",
        icon: "Smartphone", // Reusing icon, context makes it clear
        examples: [
          "Ensure the feature is enabled in device settings.",
          "Requires location services and an internet connection on the lost device.",
          "Test the location feature periodically.",
        ],
      },
    ],
  },
  awareness: {
    title: "Threat Awareness & Safe Habits", // Renamed
    icon: <BrainCircuit size={20} className="text-inherit" />,
    tips: [
      {
        title: "Identify and Avoid Phishing & Social Engineering", // Enhanced title
        description:
          "Be skeptical of unsolicited emails, texts (smishing), calls (vishing), or social media messages asking for credentials, personal info, or urging immediate action. Verify sender identities. Hover over links to check destinations. Look for poor grammar, generic greetings, or unusual requests. When in doubt, contact the organization through official channels.",
        icon: "AlertTriangle",
        examples: [
          "Fake login pages, urgent security alerts, unexpected invoices, prize notifications.",
          "Check email headers for mismatched sender addresses.",
          "Never click links or open attachments from unknown/suspicious sources.",
          "Legitimate services will rarely ask for your password via email/message.",
        ],
        importantNote: "Social engineering preys on psychology (urgency, fear, authority, helpfulness) to trick you into compromising security."
      },
      {
        title: "Use Email Aliases & Dedicated Addresses", // Enhanced title
        description:
          "Minimize your exposure by using unique email addresses or aliases for different services, especially for less trusted sites. This limits the impact if one service is breached and helps trace sources of spam. Consider a dedicated email for financial/critical accounts.",
        icon: "AtSign",
        examples: [
          "Gmail/Outlook '+addressing': yourname+service@gmail.com.",
          "Dedicated alias services: SimpleLogin, AnonAddy.",
          "Use disposable emails for one-time signups.",
        ],
      },
      {
        title: "Treat Security Questions as Passwords", // Enhanced title
        description:
          "Answers to security questions are often easily discoverable through public records or social media. Do NOT use factual answers. Instead, generate random, unique answers and store them securely in your password manager, just like passwords.",
        icon: "HelpCircle",
        examples: [
          "Question: 'Mother's maiden name?' Answer: 'BlueElephantRunningFast7!'",
          "Question: 'First pet's name?' Answer: 'Correct-Horse-Battery-Staple'",
          "Store both the question and the fake answer in your password manager.",
        ],
        importantNote: "Factual answers significantly weaken account recovery security."
      },
      {
        title: "Manage Your Digital Footprint & Social Media Privacy", // Enhanced title
        description:
          "Be mindful of the information shared publicly online. Limit personal details on social media profiles (birthdays, locations, family names). Regularly review privacy settings on all platforms to control who sees your posts and information. Information shared online can be used for social engineering or guessing passwords/security questions.",
        icon: "LinkIcon", // Renamed import to avoid conflict
        examples: [
          "Set social media profiles to private or friends-only.",
          "Avoid oversharing location details or travel plans in real-time.",
          "Review app permissions connected to your social media accounts.",
          "Search for yourself online periodically to see what's public.",
        ],
      },
       {
        title: "Recognize Malware Risks", // New Tip
        description:
          "Be aware of different malware types that target credentials. Keyloggers record keystrokes, spyware monitors activity, and phishing malware directs you to fake sites. Avoid downloading software from untrusted sources, be cautious with email attachments, and keep security software active.",
        icon: "BookOpen", // New icon
        examples: [
          "Only download from official app stores or reputable vendor websites.",
          "Scan email attachments before opening, especially unexpected ones.",
          "Beware of fake software update prompts.",
        ],
      },
    ],
  },
  recovery: {
    title: "Account Recovery & Backup", // Renamed
    icon: <RefreshCw size={20} className="text-inherit" />,
    tips: [
      {
        title: "Secure and Maintain Recovery Methods", // Enhanced title
        description:
          "Ensure your recovery email addresses and phone numbers are up-to-date and themselves secured with strong passwords and MFA. Download and securely store any provided backup/recovery codes (e.g., 2FA backup codes) offline or in your password manager's secure notes.",
        icon: "RefreshCw",
        examples: [
          "Store backup codes in encrypted notes in your password manager.",
          "Consider printing codes and storing them in a physically secure location (safe).",
          "Regularly verify that recovery methods are current.",
          "Ensure your recovery email account has MFA enabled.",
        ],
      },
      {
        title: "Change Passwords Strategically", // Rewritten based on modern advice
        description:
          "Current best practice advises against forced, frequent password rotation unless required by policy or a compromise is suspected. Focus on creating strong, unique passwords initially. Change passwords immediately ONLY if: 1) The service suffers a breach. 2) You suspect your account or password was compromised. 3) You accidentally shared or exposed the password.",
        icon: "RefreshCw", // Keeping icon, but meaning shifts
        examples: [
          "Prioritize strength and uniqueness over frequent changes.",
          "React immediately to breach notifications or suspicious activity.",
          "Avoid incremental changes (e.g., 'PasswordJan' to 'PasswordFeb').",
        ],
        importantNote: "Unnecessary frequent changes often lead to weaker, predictable passwords, reducing overall security."
      },
      {
        title: "Enhance Financial Account Security", // Enhanced title
        description:
          "Financial accounts require extra vigilance. Enable all available security features offered by your bank/institution, such as transaction alerts (SMS/email), spending limits, and specific login security measures. Monitor statements regularly for unauthorized activity.",
        icon: "Wallet",
        examples: [
          "Set up alerts for large transactions, international usage, or login attempts.",
          "Use virtual credit card numbers for online shopping where possible.",
          "Report lost/stolen cards immediately.",
          "Be wary of unsolicited calls/emails claiming to be your bank.",
        ],
      },
    ],
  },
  // --- NEW CATEGORY ---
  incident_response: {
    title: "Incident Response",
    icon: <ShieldAlert size={20} className="text-inherit" />, // New Icon
    tips: [
        {
            title: "Act Quickly After a Suspected Breach",
            description: "If you suspect an account has been compromised (e.g., receive a breach alert, notice suspicious activity), act immediately. Prioritize changing the password to a new, strong, unique one. Enable MFA if not already active. Review recent account activity and settings for unauthorized changes.",
            icon: "AlertTriangle", // Reusing icon
            examples: [
                "Change password on the affected service AND any other site using the same/similar password.",
                "Check recovery email/phone, connected apps, email forwarding rules.",
                "Log out all other active sessions if possible.",
            ],
            importantNote: "Speed is critical to limit potential damage after a compromise."
        },
        {
            title: "Report Compromises Appropriately",
            description: "Notify the relevant service provider about the suspected compromise if necessary. For financial accounts, contact your bank or credit card company's fraud department immediately. If identity theft is suspected, consider reporting it to relevant government agencies (e.g., FTC in the US).",
            icon: "MessageSquareWarning", // Reusing icon
            examples: [
                "Use official support channels, not links from suspicious emails.",
                "Have account details ready when contacting financial institutions.",
                "Document the incident (dates, times, actions taken).",
            ],
        },
        {
            title: "Consider a Preventative Credit Freeze",
            description: "If significant personal information (like SSN, DOB) might have been exposed in a breach, consider placing a security freeze on your credit reports with the major bureaus (Equifax, Experian, TransUnion in the US). This prevents new credit accounts from being opened in your name without your explicit permission.",
            icon: "Shield", // Reusing icon
            examples: [
                "Freezes are generally free to place and lift.",
                "Requires contacting each credit bureau individually.",
                "Remember to temporarily lift the freeze if applying for new credit.",
            ],
        },
        {
            title: "Review and Learn from Incidents",
            description: "After containing an incident, try to understand how it might have happened (e.g., phishing, malware, reused password). Use this knowledge to strengthen your security practices going forward. Educate family members if their accounts might also be at risk.",
            icon: "BookOpen", // Reusing icon
            examples: [
                "Did I click a phishing link?",
                "Was the password reused?",
                "Is my device infected?",
                "Update security settings based on lessons learned.",
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

           {/* Research/Additional Info Section - Enhanced Readability */}
        <div className="mt-16 bg-gradient-to-br from-slate-50/70 via-white/50 to-blue-50/40 rounded-xl p-6 md:p-8 border border-slate-200/50 backdrop-blur-sm shadow-sm"> {/* Subtle gradient background */}
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-slate-800 text-center md:text-left"> {/* Centered on mobile */}
            Understanding the Password Security Landscape
          </h2>
          <div className="space-y-8"> {/* Increased spacing between major sections */}

            {/* Section: The Problem */}
            <section>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Despite increased awareness, a vast number of passwords actively used online remain dangerously weak due to common pitfalls like <strong className="text-slate-700">reuse across multiple sites, predictability, and reliance on easily guessable personal information</strong>. Research consistently highlights this vulnerability.
              </p>
            </section>

            {/* Section: How Passwords Are Cracked */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                 <Info size={18} className="text-primary" /> {/* Added section icon */}
                 Common Password Cracking Techniques
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4">
                Attackers leverage sophisticated methods and powerful hardware:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <BookOpen size={18} className="text-primary/80 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-600">Dictionary Attacks:</strong> Trying words, names, common phrases, and billions of passwords leaked from previous breaches.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Wand2 size={18} className="text-primary/80 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-600">Rule-Based Attacks:</strong> Applying common transformations to dictionary words (e.g., adding '123', substituting '@' for 'a', capitalizing first letter).</span>
                </li>
                <li className="flex items-start gap-3">
                  <Gauge size={18} className="text-primary/80 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-600">Optimized Brute-Force:</strong> Systematically trying character combinations, prioritized by likelihood. Modern GPUs test trillions of combinations per second against weaker hashes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users size={18} className="text-primary/80 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-600">Credential Stuffing:</strong> Automatically trying username/password pairs stolen from one breach against countless other websites, exploiting password reuse.</span>
                </li>
              </ul>
            </section>

            {/* Section: Speed of Compromise */}
            <section>
               <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                 <Clock size={18} className="text-primary" /> {/* Added section icon */}
                 The Speed of Compromise
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4">
                Analysis of large breached password datasets reveals alarming statistics:
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-center"> {/* Grid layout for stats */}
                 <div className="bg-red-50/70 border border-red-200/80 rounded-lg p-3">
                     <Zap size={20} className="text-red-500 mx-auto mb-1"/>
                     <p className="text-2xl font-bold text-red-600">~45%</p>
                     <p className="text-xs text-red-700">Cracked Instantly (&lt; 1 min)</p>
                 </div>
                 <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3">
                     <Clock size={20} className="text-amber-500 mx-auto mb-1"/>
                     <p className="text-2xl font-bold text-amber-600">~60%</p>
                      <p className="text-xs text-amber-700">Cracked within 1 Hour</p>
                 </div>
                 <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3">
                     <ShieldCheck size={20} className="text-emerald-500 mx-auto mb-1"/>
                     <p className="text-2xl font-bold text-emerald-600">~20-25%</p>
                      <p className="text-xs text-emerald-700">Resilient (&gt; 1 Year)</p>
                 </div>
              </div>
               <p className="text-xs text-center mt-3 text-slate-500">
                 (Based on typical findings in security research analyzing common password weaknesses)
               </p>
            </section>

            {/* Section: Key Insights */}
            <section className="space-y-4">
                {/* Insight 1: Complexity vs Reality */}
                <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-200/70 rounded-lg p-4">
                    <Lightbulb size={24} className="text-blue-600 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Insight: Perceived Complexity vs. Reality</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Human intuition about 'complex' passwords (like `P@$$wOrd!`) often fails. Simple substitutions and common patterns offer negligible defense against automated cracking tools designed to check these variations instantly.
                        </p>
                    </div>
                </div>

                {/* Insight 2: Entropy & Length */}
                 <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-200/70 rounded-lg p-4">
                    <KeyRound size={24} className="text-blue-600 shrink-0 mt-1" /> {/* Changed icon */}
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Insight: Entropy is Key</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                           True security comes from <strong className="font-medium">mathematical entropy</strong>, primarily driven by <strong className="font-medium">length and true randomness</strong> within the chosen character set. Each additional random character exponentially increases cracking time.
                        </p>
                    </div>
                </div>

                {/* Insight 3: Hardware Advancements */}
                <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-200/70 rounded-lg p-4">
                    <TrendingUp size={24} className="text-blue-600 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Insight: Hardware Gets Faster</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Rapid improvements in computing power (especially GPUs) mean password length recommendations become outdated. Passwords considered 'strong' years ago might be crackable in hours or days today. Ongoing vigilance is necessary.
                        </p>
                    </div>
                </div>
            </section>


            {/* Section: Recommendations */}
            <section className="mt-8 pt-6 border-t border-slate-300/60"> {/* Added top border */}
               <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Key Recommendations</h3>
                <div className="bg-primary/5 rounded-lg p-5 text-center space-y-3">
                    <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                        This reality underscores the critical importance of adopting robust security practices:
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600 inline-block text-left max-w-lg mx-auto"> {/* Centered list */}
                        <li className="flex items-center gap-2">
                            <KeyRound size={16} className="text-primary shrink-0"/>
                            <span>Use a <strong className="text-slate-700">Password Manager</strong> to generate and store strong, unique passwords.</span>
                        </li>
                         <li className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-primary shrink-0"/>
                            <span>Enable <strong className="text-slate-700">Multi-Factor Authentication (MFA)</strong> everywhere possible.</span>
                        </li>
                         <li className="flex items-center gap-2">
                            <BookOpen size={16} className="text-primary shrink-0"/>
                            <span>Stay informed about <strong className="text-slate-700">phishing and social engineering</strong> tactics.</span>
                        </li>
                    </ul>
                    <p className="text-xs text-slate-500 pt-2">
                        Cybersecurity requires ongoing vigilance to safeguard your digital life.
                    </p>
                </div>
            </section>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SecurityTips;