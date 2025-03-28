
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SECURITY_TIPS } from "@/constants/config";
import { Shield, KeyRound, ShieldCheck, Lock, AlertTriangle, RefreshCw, FileText, Smartphone, Search, AtSign, HelpCircle, Link, Wallet, Eye, Layers, BrainCircuit, Computer, Fingerprint, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Enhanced security tips with more detailed content
const ENHANCED_SECURITY_TIPS = {
  passwords: {
    title: "Password Security",
    icon: <Lock size={20} />,
    tips: [
      {
        title: "Use a Password Manager",
        description: "Password managers generate, store, and autofill strong, unique passwords for all your accounts. This prevents password reuse and makes it easier to use complex passwords. Most password managers also offer secure sharing, breach monitoring, and cross-device synchronization.",
        icon: "KeyRound",
        examples: [
          "1Password, Bitwarden, LastPass, and KeePass are popular options",
          "Many browsers now have built-in password managers, though dedicated solutions often provide better security"
        ]
      },
      {
        title: "Create Strong, Unique Passwords",
        description: "Use long passwords (12+ characters) with a mix of uppercase and lowercase letters, numbers, and symbols. Never reuse passwords across different sites or services, as a breach on one site could compromise all your accounts.",
        icon: "Lock",
        examples: [
          "Random passwords like 'X3f!pT8&vZ@q' are ideal for maximum security",
          "Passphrases like 'correct-horse-battery-staple-42!' are easier to remember"
        ]
      },
      {
        title: "Use Passphrases Instead of Passwords",
        description: "Consider using a series of random words with numbers and symbols which are easier to remember but harder to crack than shorter complex passwords. The length adds significant entropy while maintaining memorability.",
        icon: "FileText",
        examples: [
          "Example: 'grape-stapler-rhino-7!' (much stronger than 'P@ssw0rd1')",
          "Four random words plus a number and symbol can have over 100 bits of entropy"
        ]
      },
      {
        title: "Regularly Audit Your Passwords",
        description: "Periodically review your password security, especially for critical accounts. Look for weak, reused, or compromised passwords. Update passwords for important services at least annually, even if there's no known breach.",
        icon: "ListChecks",
        examples: [
          "Use your password manager's security audit feature",
          "Check breach monitoring services like 'Have I Been Pwned'"
        ]
      },
      {
        title: "Use Different Password Patterns for Different Security Levels",
        description: "Consider categorizing your accounts by importance and using different password strategies. Critical accounts (email, banking, password manager) should have the strongest possible passwords, while less important accounts can use simpler (but still strong) passwords.",
        icon: "Layers",
        examples: [
          "Critical: 20+ random characters with maximum complexity",
          "Important: 16+ character passphrases with symbols",
          "Standard: 12+ character unique passwords"
        ]
      }
    ]
  },
  authentication: {
    title: "Authentication Methods",
    icon: <Fingerprint size={20} />,
    tips: [
      {
        title: "Enable Two-Factor Authentication (2FA)",
        description: "Add an extra layer of security by enabling 2FA on all accounts that support it. Even if someone gets your password, they won't be able to access your account without the second factor. Authenticator apps are more secure than SMS-based 2FA.",
        icon: "ShieldCheck",
        examples: [
          "Authenticator apps: Google Authenticator, Microsoft Authenticator, Authy",
          "Hardware security keys like YubiKey offer the strongest protection",
          "Biometric factors (fingerprint, face recognition) when available"
        ]
      },
      {
        title: "Use Biometric Authentication When Available",
        description: "Modern devices offer fingerprint, face, or iris recognition as authentication methods. These are generally more convenient and secure than passwords for device access, though they should be combined with a strong password or PIN as backup.",
        icon: "Fingerprint",
        examples: [
          "Use Touch ID/Face ID for phones and laptops",
          "Enable Windows Hello or macOS Touch ID",
          "Remember that biometrics still need a password backup"
        ]
      },
      {
        title: "Implement Risk-Based Authentication",
        description: "When setting up security for business systems, consider risk-based authentication that adapts to the user's behavior, location, and device. This provides better security while reducing friction for legitimate access.",
        icon: "BrainCircuit",
        examples: [
          "Requiring additional verification for unusual locations or new devices",
          "Using single sign-on (SSO) solutions for enterprise systems",
          "Implementing adaptive authentication based on risk profiles"
        ]
      }
    ]
  },
  monitoring: {
    title: "Security Monitoring",
    icon: <Eye size={20} />,
    tips: [
      {
        title: "Regularly Check for Data Breaches",
        description: "Regularly check services like 'Have I Been Pwned' to see if your email has been involved in a data breach, and change passwords for affected accounts immediately. Many password managers now include breach monitoring features as well.",
        icon: "Search",
        examples: [
          "Set up breach alerts for your email addresses",
          "Check quarterly for any new breaches affecting your accounts",
          "Check if family members' accounts have been compromised too"
        ]
      },
      {
        title: "Monitor Account Activity",
        description: "Regularly review login activity, recent sessions, and connected applications for your important accounts. Many services provide activity logs that can help you spot unauthorized access or suspicious behavior.",
        icon: "Eye",
        examples: [
          "Review Google's security dashboard and recent activity",
          "Check Facebook's 'Where You're Logged In' section",
          "Monitor bank and credit card transactions regularly"
        ]
      },
      {
        title: "Use Identity Theft Protection Services",
        description: "Consider using identity theft protection services that monitor credit reports, dark web mentions of your personal information, and unauthorized use of your identity. These services often provide insurance and recovery assistance if your identity is stolen.",
        icon: "Shield",
        examples: [
          "Services like LifeLock, Identity Guard, or IdentityForce",
          "Credit monitoring through major credit bureaus",
          "Financial institutions often offer some form of identity monitoring"
        ]
      }
    ]
  },
  devices: {
    title: "Device Security",
    icon: <Computer size={20} />,
    tips: [
      {
        title: "Keep Your Devices Secure",
        description: "Keep your operating system, browsers, and apps updated. Use antivirus software and firewalls to protect against malware that could steal your passwords. Enable disk encryption on all devices to protect data if they're lost or stolen.",
        icon: "Smartphone",
        examples: [
          "Enable automatic updates for all software",
          "Use disk encryption: BitLocker (Windows), FileVault (Mac), or built-in encryption (mobile)",
          "Never leave devices unlocked when unattended"
        ]
      },
      {
        title: "Secure Your Home Network",
        description: "Protect your home WiFi with a strong password and WPA3 encryption if available. Change default router credentials, enable automatic updates, and consider setting up a guest network for visitors and IoT devices.",
        icon: "Computer",
        examples: [
          "Use a unique, strong password for your WiFi network",
          "Update router firmware regularly",
          "Consider using a VPN for additional privacy"
        ]
      },
      {
        title: "Be Cautious with Public WiFi",
        description: "Avoid accessing sensitive accounts or entering passwords when connected to public WiFi networks. If you must use public WiFi, connect through a VPN to encrypt your traffic and protect your data from snoopers.",
        icon: "AlertTriangle",
        examples: [
          "Use a reputable VPN service when on public networks",
          "Avoid banking or shopping on public WiFi without a VPN",
          "Disable auto-connect to unknown WiFi networks"
        ]
      }
    ]
  },
  awareness: {
    title: "Security Awareness",
    icon: <BrainCircuit size={20} />,
    tips: [
      {
        title: "Be Wary of Phishing Attempts",
        description: "Be suspicious of unexpected emails, messages, or calls asking for your password or personal information. Legitimate companies won't ask for your password. Check email sender addresses carefully and hover over links before clicking. When in doubt, go directly to the website by typing the URL.",
        icon: "AlertTriangle",
        examples: [
          "Look for spelling errors or unusual urgency in messages",
          "Verify requests through official channels or by contacting the company directly",
          "Never provide passwords or sensitive information in response to emails"
        ]
      },
      {
        title: "Use Unique Email Addresses",
        description: "Consider using different email addresses or aliases for different types of accounts to limit damage if one account is compromised. This also helps identify which service leaked your email if you start receiving spam.",
        icon: "AtSign",
        examples: [
          "Use email aliases through services like Gmail (+ symbol) or outlook.com",
          "Consider a separate email for financial accounts",
          "Use disposable email addresses for one-time registrations"
        ]
      },
      {
        title: "Be Careful with Security Questions",
        description: "Treat security questions like secondary passwords. Consider using fictional answers that only you would know, as factual answers might be discoverable online. Store these answers in your password manager.",
        icon: "HelpCircle",
        examples: [
          "Use answers unrelated to the question but memorable to you",
          "Avoid information that could be found on social media",
          "Store security question answers in your password manager"
        ]
      },
      {
        title: "Practice Safe Social Media",
        description: "Be mindful of the personal information you share online that could be used to guess passwords or answer security questions. Configure privacy settings carefully and periodically review who can see your information.",
        icon: "Link",
        examples: [
          "Avoid sharing birthdays, addresses, phone numbers publicly",
          "Don't post about upcoming travel until after you return",
          "Regularly review tagged photos and posts"
        ]
      }
    ]
  },
  recovery: {
    title: "Backup & Recovery",
    icon: <RefreshCw size={20} />,
    tips: [
      {
        title: "Prepare for Account Recovery",
        description: "Set up recovery methods for your important accounts and keep them updated. This includes recovery email addresses, phone numbers, and backup codes. Store backup codes securely in your password manager or printed in a safe location.",
        icon: "RefreshCw",
        examples: [
          "Download and securely store backup/recovery codes for crucial accounts",
          "Keep recovery email addresses and phone numbers current",
          "Consider setting up trusted contacts for account recovery"
        ]
      },
      {
        title: "Regularly Update Your Passwords",
        description: "Change your passwords regularly, especially for critical accounts like email and banking. Always change passwords immediately after a service announces a data breach, or if you suspect your account has been compromised.",
        icon: "RefreshCw",
        examples: [
          "Change passwords immediately if you suspect a breach",
          "Rotate passwords for critical accounts annually",
          "Use your password manager's password changer feature if available"
        ]
      },
      {
        title: "Protect Your Financial Accounts",
        description: "Add extra security to financial accounts by enabling alerts for transactions, using dedicated security tools offered by your bank, and considering a credit freeze to prevent identity theft.",
        icon: "Wallet",
        examples: [
          "Enable transaction alerts for unusual activity",
          "Consider a credit freeze if you're not applying for new credit",
          "Use virtual card numbers for online shopping when available"
        ]
      }
    ]
  }
};

const SecurityTips = () => {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("passwords");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Map icon names to component
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      "KeyRound": <KeyRound className="h-6 w-6" />,
      "ShieldCheck": <ShieldCheck className="h-6 w-6" />,
      "Lock": <Lock className="h-6 w-6" />,
      "AlertTriangle": <AlertTriangle className="h-6 w-6" />,
      "RefreshCw": <RefreshCw className="h-6 w-6" />,
      "FileText": <FileText className="h-6 w-6" />,
      "Smartphone": <Smartphone className="h-6 w-6" />,
      "Search": <Search className="h-6 w-6" />,
      "AtSign": <AtSign className="h-6 w-6" />,
      "HelpCircle": <HelpCircle className="h-6 w-6" />,
      "Link": <Link className="h-6 w-6" />,
      "Wallet": <Wallet className="h-6 w-6" />,
      "Eye": <Eye className="h-6 w-6" />,
      "Layers": <Layers className="h-6 w-6" />,
      "BrainCircuit": <BrainCircuit className="h-6 w-6" />,
      "Computer": <Computer className="h-6 w-6" />,
      "Fingerprint": <Fingerprint className="h-6 w-6" />,
      "ListChecks": <ListChecks className="h-6 w-6" />
    };
    
    return icons[iconName] || <Shield className="h-6 w-6" />;
  };
  
  return (
    <Layout>
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className={`text-center max-w-2xl mx-auto mb-8 md:mb-12 transition-all duration-1000 ${mounted ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-10'}`}>
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <Shield size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Security Tips & Best Practices
          </h1>
          <p className="text-lg text-muted-foreground">
            Essential guidance to help you keep your online accounts secure and protect your digital identity.
          </p>
        </div>
        
        {isMobile ? (
          <Tabs defaultValue="passwords" value={activeCategory} onValueChange={setActiveCategory} className="w-full mb-6">
            <ScrollArea className="w-full pb-2">
              <TabsList className="w-full flex justify-start py-1 px-0 h-auto whitespace-nowrap">
                {Object.entries(ENHANCED_SECURITY_TIPS).map(([key, category]) => (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 px-3">
                    {category.icon}
                    <span>{category.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
            
            {Object.entries(ENHANCED_SECURITY_TIPS).map(([key, category]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="space-y-4">
                  {category.tips.map((tip, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl p-4 shadow-sm",
                        "hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]",
                        mounted ? `opacity-100 transform translate-y-0 delay-${Math.min(index * 100, 400)}` : "opacity-0 transform translate-y-4"
                      )}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10 w-fit h-fit text-primary shrink-0 mt-1">
                            {getIcon(tip.icon)}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-2">{tip.title}</h3>
                            <p className="text-muted-foreground text-sm">{tip.description}</p>
                            
                            {tip.examples && tip.examples.length > 0 && (
                              <div className="mt-3 bg-slate-50/80 rounded-lg p-3">
                                <p className="text-xs font-medium text-slate-700 mb-1">Examples:</p>
                                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                                  {tip.examples.map((example, i) => (
                                    <li key={i}>{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 bg-white/30 rounded-xl border border-slate-200/50 p-3 h-fit sticky top-4">
              <div className="space-y-1.5">
                {Object.entries(ENHANCED_SECURITY_TIPS).map(([key, category]) => (
                  <button
                    key={key}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 transition-colors",
                      activeCategory === key ? "bg-primary/10 text-primary font-medium" : "hover:bg-slate-100 text-slate-700"
                    )}
                    onClick={() => setActiveCategory(key)}
                  >
                    {category.icon}
                    <span>{category.title}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-3 space-y-5">
              <h2 className="text-2xl font-semibold mb-4">{ENHANCED_SECURITY_TIPS[activeCategory as keyof typeof ENHANCED_SECURITY_TIPS].title}</h2>
              
              <div className="grid gap-5 md:grid-cols-2">
                {ENHANCED_SECURITY_TIPS[activeCategory as keyof typeof ENHANCED_SECURITY_TIPS].tips.map((tip, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl p-5 shadow-sm",
                      "hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]",
                      mounted ? `opacity-100 transform translate-y-0 delay-${Math.min(index * 100, 500)}` : "opacity-0 transform translate-y-4"
                    )}
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-3 p-2 rounded-full bg-primary/10 w-fit text-primary">
                        {getIcon(tip.icon)}
                      </div>
                      <h3 className="text-lg font-medium mb-2">{tip.title}</h3>
                      <p className="text-muted-foreground text-sm flex-grow">{tip.description}</p>
                      
                      {tip.examples && tip.examples.length > 0 && (
                        <div className="mt-4 bg-slate-50/80 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-700 mb-1">Examples:</p>
                          <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                            {tip.examples.map((example, i) => (
                              <li key={i}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-16 bg-slate-50/80 rounded-xl p-6 border border-slate-200/50">
          <h2 className="text-xl font-medium mb-4">Research-Based Password Security</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Recent research shows that <strong>59% of real-world passwords can be cracked in less than an hour</strong> using modern hardware and smart guessing algorithms. This alarming statistic highlights the critical importance of strong, unique passwords.
            </p>
            <p>
              According to security researchers, the breakdown of password cracking times is:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>45%</strong> of passwords are cracked in less than a minute</li>
              <li>An additional <strong>14%</strong> are cracked within an hour</li>
              <li>Only <strong>23%</strong> of passwords take more than a year to crack</li>
            </ul>
            <p className="text-slate-700 border-l-4 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r-md italic">
              "Passwords that seem complex to humans often follow patterns that are easily detected by password-cracking tools. Even substituting characters (like 'a' with '@') provides little additional security against modern cracking methods."
            </p>
            <p>
              Remember that cybersecurity is an ever-evolving field. Stay informed about the latest security threats and best practices, and always prioritize the security of your most important accounts.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SecurityTips;
