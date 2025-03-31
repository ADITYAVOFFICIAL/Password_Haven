// src/pages/FAQ.tsx or src/components/FAQ.tsx
// Adjust the path based on your project structure

import { useState, useEffect, ReactNode } from "react";
import { Layout } from "@/components/Layout"; // Adjust path if needed
import {
  ChevronDown,
  HelpCircle,
  Shield,
  Search,
  AlertTriangle,
  Key,
  Zap, // Added icon
  Database, // Added icon
} from "lucide-react";
import { cn } from "@/lib/utils"; // Adjust path if needed
import { useIsMobile } from "@/hooks/useIsMobile"; // Adjust path if needed
import { Link } from "react-router-dom"; // Assuming you use react-router-dom
import { Button } from "@/components/ui/button"; // Adjust path if needed

// --- Updated & Expanded Data Structure for FAQ ---

const FAQ_CATEGORIES = {
  general: {
    title: "General",
    icon: <HelpCircle size={16} className="text-inherit" />, // Matched size/style
    items: [
      {
        question: "What is the Password Strength Analyzer?",
        answer:
          "Our Password Strength Analyzer is an advanced tool that evaluates how secure your password is using multiple factors including length, character variety, entropy, common patterns, and similarity to known compromised passwords. It provides real-time feedback, AI-powered suggestions, and time-to-crack estimates based on modern password cracking techniques.",
      },
      {
        question: "How does the password strength analyzer work?",
        answer:
          "Our analyzer evaluates multiple factors: 1) Character composition (length, uppercase, lowercase, numbers, symbols), 2) Entropy calculation, 3) Pattern detection (common words, sequences, keyboard patterns), 4) Cross-reference with breached password databases (using k-anonymity), and 5) AI analysis for vulnerabilities. We then calculate estimates of how long it would take modern computers to crack your password using various attack methods.",
      },
      {
        question: "Is my password stored anywhere when I use this tool?",
        answer:
          "No, absolutely not. Your password is never stored, logged, or sent to any server in its original form. All analysis primarily happens directly within your browser. When checking against breach databases, we use a secure k-anonymity model which only sends a partial hash, never the password itself, ensuring your privacy.",
      },
       {
        question: "Why should I use this tool instead of just a password manager generator?",
        answer:
          "Password manager generators are excellent for creating strong, random passwords. This tool serves a different purpose: 1) Education: It helps you understand *why* certain passwords are weak or strong. 2) Evaluation: You can test password *ideas* or *patterns* you're considering before using them. 3) Existing Passwords: You can check the strength of older passwords (use similar variations, not exact ones for high-value accounts) to see if they need updating. 4) Master Passwords: It helps assess the strength of your crucial password manager master password."
      },
      {
        question: "Can I trust this tool with my sensitive passwords?",
        answer:
          "Yes. We've designed this tool with privacy as the top priority. Your password is never transmitted over the network in its original form, all analysis happens locally in your browser, and we use secure cryptographic techniques when checking against breach databases. However, as a best practice, we recommend not entering your *exact*, current high-value passwords (like banking), but rather testing similar passwords or patterns to understand their strength.",
      },
      {
        question: "Why do I need a strong password if I use 2FA/MFA?",
        answer:
          "While 2FA/MFA provides an excellent additional layer of security, a strong password remains your first line of defense. Attackers constantly develop new methods, and some sophisticated attacks (like session hijacking or MFA fatigue) can potentially bypass MFA, especially if they already possess your password. A strong, unique password minimizes the initial risk. Think of it as having both a strong lock and an alarm system – they work best together.",
      },
       {
        question: "Is this tool free to use?",
        answer:
          "Yes, the Password Strength Analyzer is completely free to use. Our goal is to provide accessible security education and tools to help everyone improve their online safety.",
      },
    ],
  },
  analysis: {
    title: "Password Analysis",
    icon: <Search size={16} className="text-inherit" />,
    items: [
      {
        question: "What makes a strong password?",
        answer:
          "A strong password generally combines several key characteristics: 1) **Length:** 16+ characters is highly recommended for critical accounts. 2) **Complexity:** A mix of uppercase letters, lowercase letters, numbers, and symbols. 3) **Unpredictability:** Avoids common dictionary words, names, dates, sequences (abc, 123), or keyboard patterns (qwerty). 4) **Uniqueness:** Never reused across different websites or services. 5) **High Entropy:** Mathematically random and hard to guess.",
      },
      {
        question: "What are 'Time-to-Crack' estimates based on?",
        answer:
          "Our Time-to-Crack estimates are calculated based on current computational power and widely used password-cracking techniques (like those employed by tools such as Hashcat). We model scenarios including: 1) **Offline Slow Hash (Brute Force):** Simulates attacks against strong hashing algorithms (like bcrypt) where each guess takes longer. 2) **Offline Fast Hash (Smart Guessing):** Simulates attacks against weaker hashes (like MD5) using optimized guessing based on patterns and dictionaries. Estimates account for the password's length, complexity, entropy, and recognized patterns.",
      },
      {
        question: "Why does my seemingly complex password get a low score?",
        answer:
          "This often happens because while the password looks random to a human, it contains patterns easily detected by cracking software. Common reasons include: 1) Using dictionary words with simple substitutions (e.g., P@ssw0rd). 2) Following predictable patterns (e.g., CapitalWord + Year + Symbol!). 3) Using keyboard sequences (e.g., 'qazwsx123'). 4) Reusing parts of usernames or website names. 5) The password, or a very similar one, exists in known breach lists.",
      },
      {
        question: "What is password entropy and why does it matter?",
        answer:
          "Entropy, measured in bits, quantifies the randomness or unpredictability of your password. Each bit of entropy doubles the number of possible passwords a brute-force attacker would need to try. Higher entropy means exponentially more security. For example, a password with 60 bits of entropy is vastly stronger than one with 30 bits. Aiming for 80+ bits (achievable with ~12-14 truly random characters using all types) provides excellent protection against brute-force attacks with current technology.",
      },
       {
        question: "Does adding just one symbol or number significantly improve strength?",
        answer:
          "It depends. Adding a single symbol or number to a very weak password (like 'password' becoming 'password!') offers minimal improvement against modern cracking tools, as this is a common pattern they check immediately. However, adding diverse characters to an already reasonably long and complex password significantly increases the *keyspace* (total possible combinations) and thus raises the brute-force cracking time and entropy.",
      },
      {
        question: "Why does my password show as potentially breached?",
        answer:
          "This indicates that your password, or a password following the same pattern, has likely appeared in one or more publicly known data breaches. Attackers compile massive lists of these breached passwords (billions exist) and use them in 'dictionary' and 'credential stuffing' attacks. Even if *your* specific account wasn't breached using that password, the fact that the password is 'known' makes it extremely risky to use anywhere.",
      },
      {
        question: "How accurate are the entropy calculations?",
        answer:
          "Our entropy calculations (often based on libraries like zxcvbn) provide a good estimate based on character set and length, factoring in deductions for common patterns, words, and sequences. It's more accurate than simply calculating theoretical entropy based on length alone. However, it's still an estimate; extremely complex or novel patterns might not be fully penalized, while very obscure dictionary words might be missed. It's a strong guide but not an absolute guarantee.",
      },
      {
        question: "What does 'Smart Guessing' mean in the Time-to-Crack estimates?",
        answer:
          "Smart Guessing (also related to dictionary attacks and pattern analysis) refers to cracking techniques that prioritize likely password candidates over random brute-force. These algorithms use massive dictionaries of real-world passwords, common words, names, dates, apply transformation rules (like adding '123' or '!' at the end, substituting 'a' with '@'), and check for keyboard patterns. This is highly effective against human-created passwords, often cracking them millions of times faster than pure brute-force.",
      },
    ],
  },
  security: {
    title: "Security & Privacy",
    icon: <Shield size={16} className="text-inherit" />,
    items: [
      {
        question: "What breach databases does this tool reference?",
        answer:
          "Our tool checks for patterns and known passwords found in major publicly documented data breaches. This includes massive compilations like RockYou, Collection #1-#5, BreachCompilation, and specific large breaches from services like LinkedIn, Adobe, MySpace, Canva, etc. We utilize the Have I Been Pwned (HIBP) Pwned Passwords dataset, which contains billions of passwords seen in breaches, accessed via the secure k-anonymity API.",
      },
        {
        question: "How does the 'k-anonymity' check protect my password?",
        answer:
          "The k-anonymity model ensures we can check if your password is in a breach database without ever sending the full password (or even its full hash) to any external service. Here's how: 1) Your password is hashed locally using SHA-1. 2) Only the first 5 characters of that hash are sent to the HIBP API. 3) The API returns a list of all hash suffixes (the part *after* the first 5 characters) in the database that start with those same 5 characters. 4) Your browser locally compares your *full* hash against that returned list. Your actual password or full hash never leaves your device.",
      },
      {
        question: "How can I check if my *email* has been in a data breach?",
        answer:
          "While our tool focuses on password security, the best resource for checking email breaches is Troy Hunt's 'Have I Been Pwned' website (haveibeenpwned.com). You can enter your email address there to see if it has appeared in known data breaches. If it has, you should immediately change the passwords for the affected accounts and any others where you might have reused that password.",
      },
      {
        question: "Are the AI-generated suggestions secure?",
        answer:
          "The AI suggestions aim to improve upon your entered password by addressing identified weaknesses (like adding complexity, length, or breaking patterns) based on security best practices. They are generally much stronger. However, true randomness is hard for AI to guarantee perfectly. For maximum security, especially for critical accounts, using a dedicated password manager to generate a fully random password is still the gold standard.",
      },
      {
        question: "Why does the score sometimes change slightly for the same password?",
        answer:
          "Password scoring is complex and relies on continuously updated data and algorithms. Minor score variations might occur due to: 1) Updates to the underlying password analysis library (like zxcvbn). 2) Updates to the breach datasets used for comparison (though this usually only flags previously safe passwords as pwned). 3) Potential A/B testing or refinements in our specific scoring adjustments or AI analysis components. Significant changes are rare unless a major vulnerability is discovered or datasets are updated.",
      },
      {
        question: "What security measures are in place for the AI analysis?",
        answer:
            "When AI analysis is used (e.g., via Google Gemini), the password and its context are sent securely over HTTPS. We configure the API calls not to store or log the input data on the AI provider's side where possible. However, the most sensitive analysis (like breach checks via k-anonymity and core zxcvbn scoring) happens locally in your browser to minimize data exposure."
      },
    ],
  },
  techniques: {
    title: "Password Techniques",
    icon: <Key size={16} className="text-inherit" />,
    items: [
      {
        question: "What are the most common password cracking techniques?",
        answer:
          "Attackers use various methods: 1) **Dictionary Attacks:** Trying words from dictionaries, lists of common passwords, and breach data. 2) **Brute Force:** Systematically trying every possible character combination (slow but eventually effective for short passwords). 3) **Rule-Based Attacks:** Applying transformations to dictionary words (e.g., 'password' -> 'P@ssword1!'). 4) **Pattern Matching:** Targeting predictable human patterns (e.g., NameYYYY, KeyboardWalks). 5) **Credential Stuffing:** Using username/password pairs stolen from one site on other sites. 6) **Rainbow Table Attacks:** Using precomputed hashes to speed up cracking (less effective with proper salting).",
      },
      {
        question: "How long should my password be in 2024 and beyond?",
        answer:
          "Length is crucial. For standard online accounts, **12-15 characters** is a good minimum baseline. For critical accounts (email, banking, password manager), **16-20 characters or more** is strongly recommended. Longer is generally better, especially when using passphrases, as each additional character exponentially increases the brute-force cracking time.",
      },
      {
        question: "Are passphrases (e.g., 'correct horse battery staple') really secure?",
        answer:
          "Yes, long passphrases made of *randomly chosen* words can be extremely secure and often easier to remember than complex shorter strings. The XKCD method ('correct horse battery staple') demonstrated this well. The security comes from the length. Four random common words offer significant entropy. However, avoid common *phrases* or predictable sequences of words. Adding a number or symbol can enhance them further.",
      },
      {
        question: "How often should I change my passwords?",
        answer:
          "Modern security guidance has shifted away from mandatory, scheduled password changes (e.g., every 90 days), as this often leads users to create weaker, predictable passwords. Instead, best practice is to use a **strong, unique password** for every account and change it only when necessary: 1) If you suspect the account or password has been compromised. 2) After a service announces a data breach involving user credentials. 3) If you accidentally shared or exposed the password.",
      },
       {
        question: "What is 'salting' in password hashing?",
        answer:
          "Salting is a critical security technique. Before hashing a password, a unique, random value (the 'salt') is added to it. This salt is then stored alongside the hash in the database. When a user logs in, the stored salt is retrieved, added to the entered password, and *then* hashed for comparison. Salting ensures that even if two users have the identical password, their stored hashes will be different. This prevents attackers from using precomputed 'rainbow tables' to crack many passwords at once.",
      },
      {
        question: "What's the difference between bcrypt, scrypt, and Argon2?",
        answer:
          "These are all modern, recommended password hashing functions designed to be slow and computationally expensive, making brute-force attacks much harder. **bcrypt** is the oldest, widely used, and well-tested. **scrypt** is designed to be even more memory-intensive than bcrypt, offering better resistance against custom hardware attacks (ASICs). **Argon2** is the winner of the Password Hashing Competition (2015) and is highly configurable, offering strong resistance against GPU cracking and various tradeoffs between memory and CPU cost (Argon2d, Argon2i, Argon2id). Argon2id is often recommended today.",
      },
       {
        question: "Is it safe to let my browser save my passwords?",
        answer:
          "Modern browser password managers (Chrome, Firefox, Edge, Safari) have significantly improved their security and offer convenience. They are generally much better than reusing passwords or using weak ones. However, dedicated password manager applications usually offer more features (secure sharing, breach monitoring, better cross-platform support, potentially stronger encryption/master password handling) and are often considered a more robust solution, especially if your device itself might be compromised.",
      },
    ],
  },
  troubleshooting: {
    title: "Troubleshooting",
    icon: <AlertTriangle size={16} className="text-inherit" />,
    items: [
       {
        question: "Why is the 'Time to Crack' estimate different from other tools?",
        answer:
          "Password strength estimation isn't standardized. Different tools use different algorithms, hardware assumptions, and datasets. Our tool uses the zxcvbn library (popular and well-regarded) combined with breach data checks and AI analysis. We aim for realistic estimates based on modern cracking capabilities (including GPU acceleration). Some tools might only check length/complexity, giving a false sense of security, while others might use older hardware models. Focus on the *relative* strength and the specific warnings provided.",
      },
      {
        question: "The tool seems slow when I type. Why?",
        answer:
          "Password analysis, especially involving pattern matching, entropy calculation, and potentially AI calls, is computationally intensive. This complex analysis runs in real-time as you type to provide immediate feedback. Slower devices or very long/complex passwords might experience a slight delay. We continuously optimize performance, but thorough analysis takes processing power.",
      },
      {
        question: "I'm seeing a network error when checking breaches. What should I do?",
        answer:
          "This usually indicates a temporary issue connecting to the Have I Been Pwned (HIBP) API used for the k-anonymity breach check. Please check your internet connection. If the issue persists, the HIBP service itself might be experiencing temporary downtime or high load. The rest of the password analysis should still function correctly. You can try again later.",
      },
       {
        question: "Why are AI features sometimes unavailable or giving errors?",
        answer:
          "The AI features rely on external services (like Google Gemini). Availability can depend on: 1) Service Status: The AI provider might have temporary outages. 2) API Keys: If the tool requires an API key for the AI service, it might be missing, invalid, or rate-limited. 3) Network Issues: Connectivity problems between your browser and the AI service. The core analysis features will typically still work even if the AI enhancement fails.",
       },
      {
        question: "How can I report a bug or suggest an improvement?",
        answer:
          "We appreciate feedback! If you find a bug, have a suggestion, or think the analysis for a specific password is inaccurate, please look for a 'Feedback' link or contact information on the site. Providing the password you tested (if comfortable) and the results you received helps us diagnose issues and improve the tool.",
      },
      {
        question: "Does the tool work offline?",
        answer:
          "Yes, absolutely. All password analysis, including strength scoring, pattern detection, and entropy calculation, happens entirely within your web browser. Your password is never sent to any external server, ensuring complete privacy and security. This means you can safely use the tool even without an internet connection."
      },
    ],
  },
};


// --- Type Definitions (Copied from previous step) ---
interface FaqItem {
    question: string;
    answer: string;
}

interface FaqCategory {
    title: string;
    icon: ReactNode;
    items: FaqItem[];
}

// --- Main FAQ Component ---

const FAQ = () => {
  // State for managing open accordion items, keyed by category
  const [openItems, setOpenItems] = useState<Record<string, number[]>>({});
  // State for entry animations
  const [mounted, setMounted] = useState(false);
  // State for the currently selected category
  const [activeCategory, setActiveCategory] = useState("general");
  // Hook to determine screen size
  const isMobile = useIsMobile();

  useEffect(() => {
    // Trigger animations on mount
    setMounted(true);
  }, []);

  // Function to toggle the open state of an FAQ item within a category
  const toggleItem = (category: string, index: number) => {
    setOpenItems((prev) => {
      const categoryItems = prev[category] || [];
      const newCategoryItems = categoryItems.includes(index)
        ? categoryItems.filter((i) => i !== index)
        : [...categoryItems, index];
      return {
        ...prev,
        [category]: newCategoryItems,
      };
    });
  };

  // --- Reusable Category Button Component (Styles aligned with SecurityTips) ---
  const CategoryButton = ({
    categoryKey,
    category,
  }: {
    categoryKey: string;
    category: FaqCategory;
  }) => (
    <button
      key={categoryKey}
      className={cn(
        // Shared + Desktop Sidebar styles from SecurityTips
        "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors duration-150",
        "text-sm", // Ensure text size matches
        activeCategory === categoryKey
          ? "bg-primary/10 text-primary font-medium" // Active state
          : "hover:bg-slate-100/80 text-slate-700" // Hover state
      )}
      onClick={() => setActiveCategory(categoryKey)}
    >
       {/* Ensure icon styling matches SecurityTips */}
       <span className={cn("shrink-0", activeCategory === categoryKey ? "text-primary" : "text-slate-500")}>
           {category.icon}
       </span>
       <span>{category.title}</span>
    </button>
  );

  // --- Reusable Accordion Item Component (No changes needed from previous step) ---
  const AccordionItem = ({
    item,
    index,
    categoryKey,
  }: {
    item: FaqItem;
    index: number;
    categoryKey: string;
  }) => {
    const isOpen = openItems[categoryKey]?.includes(index) ?? false;
    const animationDelay = Math.min(index * 100, 500); // Cap delay

    return (
      <div
        key={item.question + index}
        className={cn(
          "bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-sm overflow-hidden",
          "transition-all duration-300",
          mounted
            ? `opacity-100 transform translate-y-0 delay-${animationDelay}`
            : "opacity-0 transform translate-y-4"
        )}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        <button
          className="flex justify-between items-center w-full p-4 md:p-5 text-left"
          onClick={() => toggleItem(categoryKey, index)}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${categoryKey}-${index}`}
        >
          <h3 className="font-medium text-base md:text-lg">{item.question}</h3>
          <div className="ml-4 shrink-0 text-primary transition-transform duration-300"
               style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ChevronDown size={18} />
          </div>
        </button>
        <div
          id={`faq-answer-${categoryKey}-${index}`}
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            "text-muted-foreground text-sm md:text-base px-4 md:px-5",
            isOpen ? "max-h-[1000px] pb-4 md:pb-5 opacity-100" : "max-h-0 pb-0 opacity-0"
          )}
        >
          <p className="leading-relaxed">{item.answer}</p>
        </div>
      </div>
    );
  };

  // --- Get Data for the Currently Active Category ---
  const currentCategoryData =
    FAQ_CATEGORIES[activeCategory as keyof typeof FAQ_CATEGORIES];

  // --- Render Logic ---
  return (
    <Layout>
      {/* Use max-w-5xl to match SecurityTips */}
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Page Header */}
        <div
          className={cn(
            "text-center max-w-2xl mx-auto mb-8 md:mb-12 transition-all duration-700 ease-out",
            mounted
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform -translate-y-6"
          )}
        >
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <HelpCircle size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about password security, our
            analyzer tool, and best practices for keeping your accounts safe.
          </p>
        </div>

        {/* Main Content Area: Conditional Layout */}
        {isMobile === undefined ? (
          // Loading State
          <div className="text-center py-16 text-muted-foreground">
            Loading FAQs...
          </div>
        ) : isMobile ? (
          // --- Mobile Layout ---
          <div className="flex flex-col gap-6">
            {/* Category Buttons */}
            <div className="bg-white/30 rounded-xl border border-slate-200/50 p-3 backdrop-blur-sm">
              {/* Use space-y-1.5 to match SecurityTips */}
              <div className="space-y-1.5">
                {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
                  <CategoryButton
                    key={key}
                    categoryKey={key}
                    category={category as FaqCategory}
                  />
                ))}
              </div>
            </div>

            {/* Accordion Items */}
            {/* Use space-y-5 to match SecurityTips content */}
            <div className="space-y-5">
              {currentCategoryData.items.map((item, index) => (
                <AccordionItem
                  key={index}
                  item={item}
                  index={index}
                  categoryKey={activeCategory}
                />
              ))}
            </div>
          </div>
        ) : (
          // --- Desktop Layout (Aligned with SecurityTips) ---
          // Use grid-cols-4
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Desktop Sticky Sidebar (col-span-1) */}
            <div className="md:col-span-1">
              {/* Use sticky top-24 and matching bg/border/padding */}
              <div className="sticky top-24 bg-white/30 rounded-xl border border-slate-200/50 p-3 backdrop-blur-sm">
                {/* Use space-y-1.5 for button spacing */}
                <div className="space-y-1.5">
                  {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
                    <CategoryButton
                      key={key}
                      categoryKey={key}
                      category={category as FaqCategory}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Accordion Items (col-span-3) */}
             {/* Use space-y-5 for item spacing */}
            <div className="md:col-span-3 space-y-5">
              {currentCategoryData.items.map((item, index) => (
                <AccordionItem
                  key={index}
                  item={item}
                  index={index}
                  categoryKey={activeCategory}
                />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action / Link */}
        <div className="mt-12 md:mt-16 text-center border-t border-slate-200/50 pt-8">
          <p className="text-muted-foreground mb-4">
            Still have questions or want to learn more about strengthening your
            passwords?
          </p>
          <Link to="/securitytips">
            <Button variant="default">Explore Security Tips</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;