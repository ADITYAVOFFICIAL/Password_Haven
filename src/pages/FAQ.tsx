
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ChevronDown, ChevronUp, HelpCircle, Shield, Search, AlertTriangle, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Extended FAQ content with more detailed questions
const FAQ_CATEGORIES = {
  general: {
    title: "General",
    icon: <HelpCircle size={16} />,
    items: [
      {
        question: "What is the Password Strength Analyzer?",
        answer: "Our Password Strength Analyzer is an advanced tool that evaluates how secure your password is using multiple factors including length, character variety, entropy, common patterns, and similarity to known compromised passwords. It provides real-time feedback, AI-powered suggestions, and time-to-crack estimates based on modern password cracking techniques."
      },
      {
        question: "How does the password strength analyzer work?",
        answer: "Our analyzer evaluates multiple factors: 1) Character composition (length, uppercase, lowercase, numbers, symbols), 2) Entropy calculation, 3) Pattern detection (common words, sequences, keyboard patterns), 4) Cross-reference with breached password databases, and 5) AI analysis for vulnerabilities. We then calculate estimates of how long it would take modern computers to crack your password using various attack methods."
      },
      {
        question: "Is my password stored anywhere when I use this tool?",
        answer: "No, your password is never stored or sent to any third-party services. All analysis happens in your browser or through secure, ephemeral API calls that don't retain your data. The tool uses a k-anonymity model when checking against breach databases, which means only a partial hash of your password is sent, never the actual password itself."
      },
      {
        question: "Why does this matter? Aren't password managers enough?",
        answer: "Password managers are excellent tools, but they still rely on you having a strong master password. Additionally, understanding what makes passwords strong helps you create better passwords for high-value accounts. According to research, over 80% of data breaches involve weak or compromised passwords, making password strength a critical part of your overall security posture."
      },
      {
        question: "Can I trust this tool with my sensitive passwords?",
        answer: "Yes. We've designed this tool with privacy as the top priority. Your password is never transmitted over the network in its original form, all analysis happens locally in your browser, and we use secure cryptographic techniques when checking against breach databases. We recommend not entering your exact, current high-value passwords (like banking), but rather similar passwords to test their strength."
      },
      {
        question: "Why do I need a strong password if I use 2FA/MFA?",
        answer: "While 2FA/MFA provides an excellent additional layer of security, a strong password remains your first line of defense. In some cases, attackers may be able to bypass or intercept MFA, especially if they already have your password. Strong, unique passwords combined with MFA provide the best security posture against unauthorized access."
      }
    ]
  },
  analysis: {
    title: "Password Analysis",
    icon: <Search size={16} />,
    items: [
      {
        question: "What makes a strong password?",
        answer: "A strong password typically has these characteristics: 1) Length (12+ characters), 2) Complexity (mix of uppercase, lowercase, numbers, and symbols), 3) Unpredictability (no common words or patterns), 4) Uniqueness (not used on multiple sites), and 5) High entropy (randomness). The best passwords are either completely random or use passphrases with random elements incorporated."
      },
      {
        question: "What are 'Time-to-Crack' estimates based on?",
        answer: "Our Time-to-Crack estimates are based on current computational capabilities and common password-cracking techniques. We consider two scenarios: 1) Brute Force - trying all possible character combinations using modern hardware, and 2) Smart Guessing - using optimized algorithms that try common patterns first. Research shows that 59% of real passwords can be cracked in less than an hour with smart guessing algorithms."
      },
      {
        question: "Why does my seemingly complex password get a low score?",
        answer: "Passwords that appear complex to humans might still follow patterns that password-cracking tools can exploit. Common issues include: 1) Using patterns like 'name+year' or 'word+symbols', 2) Simple character substitutions (a→4, e→3), 3) Common keyboard patterns, 4) Dictionary words with predictable modifications, or 5) Passwords that have appeared in data breaches."
      },
      {
        question: "What is password entropy and why does it matter?",
        answer: "Entropy is a measure of randomness or unpredictability in your password, measured in bits. Higher entropy means more possible combinations and greater resistance to brute force attacks. A truly random 12-character password using all character types has about 79 bits of entropy, which would take centuries to crack with current technology. However, patterns in non-random passwords reduce their effective entropy significantly."
      },
      {
        question: "Why does my password show as potentially breached?",
        answer: "This could happen for several reasons: 1) Your exact password has appeared in a known data breach, 2) Your password follows a pattern common in breached passwords, 3) Your password contains elements (like dictionary words) that make it vulnerable to smart cracking algorithms. Remember that over 8 billion leaked passwords are publicly available to attackers for their cracking dictionaries."
      },
      {
        question: "How accurate are the entropy calculations?",
        answer: "Our entropy calculations provide an approximate measure based on ideal randomness within your character set. Actual entropy may be lower if your password contains recognizable patterns or dictionary words. For example, 'correcthorsebatterystaple' has high theoretical entropy due to length, but lower practical entropy because it contains dictionary words (even though it's still a strong passphrase approach)."
      },
      {
        question: "What does 'Smart Guessing' mean in the Time-to-Crack estimates?",
        answer: "Smart Guessing refers to advanced password cracking techniques that don't try every possible combination (brute force) but instead use algorithms trained on millions of real passwords to try the most likely combinations first. These techniques recognize patterns like 'Summer2024!' where a capitalized season is followed by a year and symbol - making them much faster than brute force for most human-created passwords."
      }
    ]
  },
  security: {
    title: "Security & Privacy",
    icon: <Shield size={16} />,
    items: [
      {
        question: "What breach databases does this tool reference?",
        answer: "Our tool references patterns from major known password breaches, including RockYou 2021 and 2024, LinkedIn, Adobe, Yahoo, and others. Collectively, these breaches contain billions of compromised credentials. When checking if your password appears in these databases, we use a secure k-anonymity model that never transmits your full password or its complete hash."
      },
      {
        question: "How can I check if my email has been in a data breach?",
        answer: "While our tool focuses on password security, you can check if your email has been involved in known data breaches using services like 'Have I Been Pwned' (haveibeenpwned.com). If your email appears in breaches, we strongly recommend changing passwords for those accounts and any other accounts where you've used the same password."
      },
      {
        question: "How accurate are the AI-generated suggestions?",
        answer: "Our AI-generated suggestions are based on extensive research into password security, cryptographic best practices, and analysis of common password weaknesses. The AI is trained to identify specific vulnerabilities in your password and provide targeted suggestions that address those weaknesses while maintaining memorability where possible."
      },
      {
        question: "Can I trust the AI-improved password suggestions?",
        answer: "The AI-improved password suggestions follow security best practices and are designed to be significantly stronger than your original password. We also cross-check generated passwords against known breach databases to ensure they haven't been previously compromised. However, for maximum security, we recommend using a password manager to generate and store truly random passwords."
      },
      {
        question: "Why does the same password sometimes get different scores?",
        answer: "Password scoring involves multiple factors including randomized elements in the AI analysis and ongoing updates to our breach databases and algorithms. Additionally, we're continuously improving our analysis engine based on the latest research in password security, which may result in score variations over time."
      },
      {
        question: "How do you protect my privacy when checking against breach databases?",
        answer: "We use the k-anonymity model developed by HIBP (Have I Been Pwned) which allows us to check if your password exists in breach databases without actually sending your password. This works by only sending the first 5 characters of a secure hash of your password, and then locally comparing the full hash with the results. Your actual password never leaves your device in its original form."
      }
    ]
  },
  techniques: {
    title: "Password Techniques",
    icon: <Key size={16} />,
    items: [
      {
        question: "What are the most common password cracking techniques?",
        answer: "The main techniques include: 1) Dictionary Attacks - trying common words and variations, 2) Brute Force - trying all possible combinations, 3) Rainbow Table Attacks - using pre-computed hash tables, 4) Pattern Matching - targeting predictable patterns like 'name+year', 5) Rule-based Attacks - applying common transformation rules to dictionary words, and 6) Credential Stuffing - trying passwords from other breached sites."
      },
      {
        question: "How long should my password be?",
        answer: "For good security in 2024, we recommend a minimum of 12 characters for important accounts, and 16+ characters for critical accounts like email, banking, or password managers. This recommendation is based on current computational capabilities and expected advances in the near future. Length is one of the most important factors in password strength."
      },
      {
        question: "Are passphrases better than complex passwords?",
        answer: "Passphrases (series of random words) can be both more secure and more memorable than traditional complex passwords. A passphrase like 'correct-horse-battery-staple' has high entropy due to length while being easier to remember than something like 'P@s5w0rd!'. However, passphrases should still be random, not common phrases, and ideally include some numbers or symbols."
      },
      {
        question: "How often should I change my passwords?",
        answer: "Current best practice is to change passwords when there's a reason to, not on a fixed schedule. Good reasons include: 1) After a known or suspected breach, 2) If you've shared the password with someone, 3) If you've used the password on a public computer, or 4) If you've been using the same password for many years. Regular forced password changes often lead to weaker passwords or predictable patterns."
      },
      {
        question: "What tools do hackers use to crack passwords?",
        answer: "Common password cracking tools include: 1) Hashcat - the world's fastest password recovery tool supporting GPU acceleration, 2) John the Ripper - a free, open-source cracking tool, 3) Hydra - focused on online password attacks, 4) THC-Hydra - supports numerous network protocols, and 5) Custom tools leveraging cloud computing resources that can test billions of passwords per second against common hashing algorithms."
      },
      {
        question: "How do password managers generate secure passwords?",
        answer: "Password managers generate truly random passwords using cryptographically secure random number generators. They create strings of characters with high entropy that have no patterns or predictable elements. These passwords are virtually impossible to crack through guessing or pattern recognition, making them far stronger than human-generated passwords."
      },
      {
        question: "What's the difference between hashing and encryption for passwords?",
        answer: "Hashing converts passwords into fixed-length strings through a one-way function - you cannot convert a hash back to the original password. Encryption, however, is reversible with the correct key. Proper password storage always uses hashing (with salt), not encryption. Modern secure hashing algorithms include bcrypt, scrypt, and Argon2, which are deliberately slow to compute to resist brute-force attacks."
      }
    ]
  },
  troubleshooting: {
    title: "Troubleshooting",
    icon: <AlertTriangle size={16} />,
    items: [
      {
        question: "Why am I seeing a warning about API keys?",
        answer: "Our tool uses Google's Gemini AI to provide enhanced password analysis. If you see a warning about missing API keys, it means the tool is operating in fallback mode with slightly reduced capabilities. The core password strength analysis still works, but some of the AI-specific features may be limited."
      },
      {
        question: "The tool says my password is strong, but another tool says it's weak. Why?",
        answer: "Different password strength meters use different algorithms and criteria. Some only check length and character types, while others (like ours) also evaluate patterns, entropy, and presence in breach databases. Our tool is designed to be more stringent because we consider real-world attack methods, not just theoretical strength."
      },
      {
        question: "How can I report a bug or suggest a feature?",
        answer: "We're constantly improving our password analyzer based on user feedback and the latest security research. If you encounter a bug or have a feature suggestion, please contact us through our website's feedback form or email support directly. We appreciate your input in making this tool more useful and accurate."
      },
      {
        question: "Does the tool work offline?",
        answer: "The basic password analysis works entirely offline in your browser. However, checking against breach databases and some of the AI-powered features require an internet connection. No sensitive data is transmitted - we use secure hashing and the k-anonymity model to protect your privacy."
      }
    ]
  }
};

const FAQ = () => {
  const [openItems, setOpenItems] = useState<Record<string, number[]>>({});
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const toggleItem = (category: string, index: number) => {
    setOpenItems(prev => {
      const categoryItems = prev[category] || [];
      return {
        ...prev,
        [category]: categoryItems.includes(index)
          ? categoryItems.filter(i => i !== index)
          : [...categoryItems, index]
      };
    });
  };
  
  return (
    <Layout>
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className={`text-center max-w-2xl mx-auto mb-8 md:mb-12 transition-all duration-1000 ${mounted ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-10'}`}>
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <HelpCircle size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about password security, our analyzer tool, and best practices for keeping your accounts safe.
          </p>
        </div>
        
        {isMobile ? (
          <Tabs defaultValue="general" value={activeCategory} onValueChange={setActiveCategory} className="w-full mb-6">
            <TabsList className="w-full overflow-x-auto flex justify-start py-1 px-0 h-auto whitespace-nowrap">
              {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1 px-3">
                  {category.icon}
                  <span>{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
              <TabsContent key={key} value={key} className="mt-4 space-y-4">
                {category.items.map((item, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-sm overflow-hidden",
                      "transition-all duration-300",
                      mounted ? `opacity-100 transform translate-y-0 delay-${Math.min(index * 100, 500)}` : "opacity-0 transform translate-y-4"
                    )}
                  >
                    <button
                      className="flex justify-between items-center w-full p-4 text-left"
                      onClick={() => toggleItem(key, index)}
                      aria-expanded={openItems[key]?.includes(index)}
                    >
                      <h3 className="font-medium text-base">{item.question}</h3>
                      <div className="ml-4 shrink-0 text-primary">
                        {openItems[key]?.includes(index) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>
                    <div 
                      className={cn(
                        "overflow-hidden transition-all duration-300 text-muted-foreground px-4",
                        openItems[key]?.includes(index) ? "max-h-[1000px] pb-4" : "max-h-0"
                      )}
                    >
                      <p className="text-sm">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="md:col-span-1 bg-white/30 rounded-xl border border-slate-200/50 p-3 h-fit sticky top-4">
              <div className="space-y-2">
                {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
                      activeCategory === key ? "bg-primary/10 text-primary font-medium" : "hover:bg-slate-100"
                    )}
                    onClick={() => setActiveCategory(key)}
                  >
                    {category.icon}
                    <span>{category.title}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-4 space-y-4">
              {FAQ_CATEGORIES[activeCategory as keyof typeof FAQ_CATEGORIES].items.map((item, index) => (
                <div 
                  key={index}
                  className={cn(
                    "bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-sm overflow-hidden",
                    "transition-all duration-300",
                    mounted ? `opacity-100 transform translate-y-0 delay-${Math.min(index * 100, 500)}` : "opacity-0 transform translate-y-4"
                  )}
                >
                  <button
                    className="flex justify-between items-center w-full p-5 text-left"
                    onClick={() => toggleItem(activeCategory, index)}
                    aria-expanded={openItems[activeCategory]?.includes(index)}
                  >
                    <h3 className="font-medium text-lg">{item.question}</h3>
                    <div className="ml-4 shrink-0 text-primary">
                      {openItems[activeCategory]?.includes(index) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300 text-muted-foreground px-5",
                      openItems[activeCategory]?.includes(index) ? "max-h-[1000px] pb-5" : "max-h-0"
                    )}
                  >
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Need more information about password security?</p>
          <Link to="/securitytips">
            <Button className="mr-2" variant="default">View Security Tips</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
