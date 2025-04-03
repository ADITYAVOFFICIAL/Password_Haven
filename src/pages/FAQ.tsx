// src/pages/FAQ.tsx or src/components/FAQ.tsx

import React, { useState, useEffect, ReactNode } from "react"; // Import React explicitly
import { Layout } from "@/components/Layout";
import {
  ChevronDown,
  HelpCircle,
  Shield,
  Search,
  AlertTriangle,
  Key,
  Zap,
  Database,
  Lock,
  Users,
  Fingerprint,
  Server,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// --- Type Definitions ---
interface FaqItem {
    question: string;
    answer: string | ReactNode;
}

interface FaqCategory {
    title: string;
    icon: ReactNode;
    items: FaqItem[];
}

// --- FAQ Data (Using the previously expanded version) ---
const FAQ_CATEGORIES: Record<string, FaqCategory> = {
    general: {
        title: "General",
        icon: <HelpCircle size={16} className="text-inherit" />, // Keep size prop on icon
        items: [
          { question: "What is the Password Strength Analyzer?", answer: "Our Password Strength Analyzer is an advanced tool designed to evaluate how secure your password is. It examines multiple factors including length, character variety (uppercase, lowercase, numbers, symbols), entropy (randomness), common patterns (like dictionary words, sequences, keyboard layouts), and checks against known compromised password lists using secure methods. It provides real-time feedback, AI-powered suggestions for improvement, and estimates how long it might take for attackers to crack your password." },
          { question: "How does the password strength analyzer work?", answer: (<>Our analyzer uses a multi-layered approach:<ol className="list-decimal pl-6 mt-2 space-y-1 text-sm"><li><strong>Character Composition:</strong> Checks length and the mix of character types (uppercase, lowercase, numbers, symbols).</li><li><strong>Entropy Calculation:</strong> Measures the password's randomness in bits. Higher entropy means more unpredictability.</li><li><strong>Pattern Detection:</strong> Uses libraries like zxcvbn to identify common dictionary words, names, dates, sequences (abc, 123), keyboard patterns (qwerty), and simple substitutions (P@ssw0rd).</li><li><strong>Breach Check (k-Anonymity):</strong> Securely checks if your password (or a hash prefix) appears in the massive Have I Been Pwned database of breached passwords without sending your actual password.</li><li><strong>AI Analysis (Optional):</strong> Leverages AI models to identify more subtle vulnerabilities or suggest context-aware improvements based on common attack vectors.</li><li><strong>Crack Time Estimation:</strong> Calculates estimated times to crack based on the password's entropy and detected weaknesses, simulating various attack scenarios (brute-force, dictionary attacks) on modern hardware.</li></ol></>) },
          { question: "Is my password stored anywhere when I use this tool?", answer: "No, absolutely not. Privacy is paramount. Your password is **never** stored, logged, or transmitted to our servers or any third-party servers in its original, readable form. All core analysis (strength scoring, pattern matching) happens directly within your browser using JavaScript. For breach checks, only an anonymized hash prefix is sent (see k-anonymity explanation). AI analysis sends data securely but is configured not to log input where possible." },
          { question: "Why should I use this tool instead of just a password manager generator?", answer: "Password manager generators excel at creating strong, random passwords – which is ideal! This tool complements them by serving different purposes: 1) **Education:** Understand *why* certain passwords (even complex-looking ones) are weak or strong. Learn about entropy, patterns, and crack times. 2) **Evaluation:** Test password *ideas* or *patterns* you might be considering before actually using them. 3) **Existing Passwords:** Check the strength of older passwords (use similar variations, not exact ones for high-value accounts) to see if they urgently need updating. 4) **Master Passwords:** Assess the strength of your crucial password manager master password (again, test variations, not the exact one if possible). 5) **Policy Compliance:** Check if a password meets specific complexity requirements (though our focus is on real-world strength)." },
          { question: "Can I trust this tool with my sensitive passwords?", answer: "We've designed the tool with security and privacy as top priorities. Analysis happens locally, and breach checks use secure k-anonymity. However, for maximum peace of mind, especially regarding your most critical passwords (like primary email, banking, password manager master password), we recommend testing *variations* or *similar patterns* rather than entering the exact, current password. This allows you to gauge strength without exposing the actual credential, adhering to the principle of least exposure." },
          { question: "Why do I need a strong password if I use 2FA/MFA?", answer: "Multi-Factor Authentication (MFA) is a vital security layer, but a strong password remains your crucial first line of defense. Attackers constantly evolve; sophisticated phishing, SIM swapping, session hijacking, or MFA fatigue attacks can potentially bypass MFA, especially if the attacker already possesses your password. A strong, unique password significantly reduces the initial attack surface and makes successful attacks much harder. Think of it as having both a strong deadbolt (password) and a security alarm (MFA) – they work best in tandem." },
          { question: "Is this tool free to use?", answer: "Yes, the core functionality of the Password Strength Analyzer is completely free to use. Our aim is to provide accessible security education and tools to empower everyone to enhance their online safety." },
          { question: "What are the limitations of this tool?", answer: "While comprehensive, the tool has limitations: 1) **Crack Time Estimates are Approximations:** They are based on current public knowledge of hardware and algorithms; dedicated attackers might have more resources. 2) **Entropy Calculation is an Estimate:** It's based on known patterns; novel or extremely complex patterns might not be fully accounted for. 3) **Breach Checks Aren't Exhaustive:** It checks against known public breaches (like HIBP), but cannot account for private breaches or future leaks. 4) **Context Matters:** The tool doesn't know where the password will be used (e.g., a low-risk forum vs. banking). Always use stronger passwords for more sensitive accounts." },
        ]
    },
    analysis: {
        title: "Password Analysis",
        icon: <Search size={16} className="text-inherit" />, // Keep size prop on icon
        items: [
          { question: "What makes a strong password?", answer: "A strong password typically exhibits several key characteristics: 1) **Length:** Crucial. Aim for 15+ characters for standard accounts, 20+ for critical ones. 2) **Complexity:** A mix of uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), and symbols (!@#$%^&*...). 3) **Unpredictability:** Avoids dictionary words, common names, dates, personal information, sequences (abc, 123), or keyboard patterns (qwerty). 4) **Uniqueness:** Must be unique to each account. Never reuse passwords. 5) **High Entropy:** Mathematically random and difficult to guess, measured in bits (aim for 80+ bits). Generated passwords from managers are best for achieving this." },
          { question: "What are 'Time-to-Crack' estimates based on?", answer: "These estimates model how long it might take an attacker using specific hardware and techniques to guess your password. Our calculations consider: 1) **Password Entropy:** The calculated randomness. 2) **Detected Weaknesses:** Penalties are applied for dictionary words, patterns, sequences, etc. 3) **Assumed Cracking Power:** We model scenarios based on publicly known capabilities of modern hardware (like high-end GPUs using tools like Hashcat) performing billions or trillions of guesses per second. 4) **Hashing Algorithm (Simulated):** Estimates often differentiate between attacks on fast hashes (like MD5, easier to crack) and slow hashes (like bcrypt, much harder). They are *estimates*, not guarantees." },
          { question: "Why does my seemingly complex password get a low score?", answer: "This is common! It usually means that while the password *looks* random to a human, it contains patterns easily detected by cracking software like zxcvbn. Reasons include: 1) **Dictionary Words with Substitutions:** 'P@ssw0rd1!' is trivial for crackers. 2) **Predictable Patterns:** 'CompanyName2024!' or 'MonthYear!'. 3) **Keyboard Sequences:** 'qaz123wsx' or similar walks. 4) **Reused Components:** Using parts of usernames, website names, or previous passwords. 5) **Common Structures:** Capital letter + word + number + symbol is a pattern itself. 6) **Presence in Breach Lists:** Even complex-seeming passwords might have been leaked previously." },
          { question: "What is password entropy and why does it matter?", answer: "Entropy, measured in bits, quantifies the randomness and unpredictability of your password. Think of it as the number of 'guesses' an attacker would need, on average, to find it via brute force. Each additional bit of entropy *doubles* the search space (possible passwords). Higher entropy means exponentially greater security against guessing attacks. For perspective: a weak password might have 20-30 bits, a decent one 60-70 bits, while a strong, randomly generated password often exceeds 100 bits. Aiming for 80+ bits provides robust protection against current brute-force technology." },
          { question: "Does adding just one symbol or number significantly improve strength?", answer: "It depends entirely on the base password. Adding '!' to 'password' (making 'password!') offers almost **no real improvement** because 'add symbol at end' is one of the first rules crackers apply. However, adding diverse character types *randomly* within an already reasonably long password significantly increases the *keyspace* (total possible combinations) and thus raises entropy and the brute-force cracking time. Complexity matters most when combined with length and randomness." },
          { question: "Why does my password show as potentially breached?", answer: "This means your password, or one following a very similar pattern, has likely appeared in one or more publicly known data breaches compiled in databases like Have I Been Pwned. Attackers use these massive lists (containing billions of credentials) for 'dictionary' and 'credential stuffing' attacks. Even if *your* specific account wasn't breached using that password, the fact that the password is 'known' and circulating makes it extremely risky to use anywhere, as attackers will try it." },
          { question: "How accurate are the entropy calculations?", answer: "Our entropy calculations (primarily using the zxcvbn library) provide a sophisticated estimate. They go beyond simple character set and length calculations by actively identifying and penalizing common patterns, words, sequences, substitutions, and reused elements. This makes them much more realistic than basic theoretical calculations. However, it's still an *estimate*. Extremely novel or complex patterns might not be fully penalized, and very obscure dictionary words could be missed. It's a strong indicator but not an absolute guarantee of security." },
          { question: "What does 'Smart Guessing' mean in the Time-to-Crack estimates?", answer: "'Smart Guessing' (related to dictionary attacks, rule-based attacks, and pattern analysis) refers to cracking techniques that don't just try random combinations (pure brute-force). Instead, they prioritize likely password candidates based on real-world data. Algorithms use huge dictionaries of breached passwords, common words, names, dates, apply transformation rules (append '123', substitute 'a' with '@', capitalize first letter), check for keyboard patterns, etc. This is vastly more efficient against human-created passwords, often cracking them millions or billions of times faster than pure brute-force." },
        ]
    },
    security: {
        title: "Security & Privacy",
        icon: <Shield size={16} className="text-inherit" />, // Keep size prop on icon
        items: [
          { question: "What breach databases does this tool reference?", answer: "Our tool primarily utilizes the extensive 'Pwned Passwords' dataset from Have I Been Pwned (HIBP), which contains billions of passwords previously exposed in publicly known data breaches. This dataset aggregates passwords from massive historical breaches like RockYou, Collection #1-#5, LinkedIn, Adobe, MySpace, Canva, and many others. We access this data securely using the k-anonymity API." },
          { question: "How does the 'k-anonymity' check protect my password?", answer: (<>The k-anonymity model is a privacy-preserving technique allowing us to check for breaches without exposing your password:<ol className="list-decimal pl-6 mt-2 space-y-1 text-sm"><li>Your browser calculates the SHA-1 hash of the password you enter.</li><li>Only the **first 5 characters** of this hash are sent to the HIBP API.</li><li>The HIBP API responds with a list of all hash suffixes (the parts *after* the first 5 characters) in its database that start with those same 5 characters. This list contains your potential suffix plus many others (hence 'k-anonymity' - you're hidden among 'k' results).</li><li>Your browser then **locally** compares the *full* SHA-1 hash of your password against the received list of suffixes.</li></ol>This ensures your actual password, or even its full hash, never leaves your device during the check.</>) },
          { question: "How can I check if my *email* has been in a data breach?", answer: (<>While this tool focuses on password strength, checking for email breaches is also crucial. The best resource is Troy Hunt's website:{" "}<a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Have I Been Pwned (haveibeenpwned.com)</a>. Enter your email address there to see if it has appeared in known breaches. If it has, you must change the password for the affected service(s) and any other accounts where you might have reused that password. Enable MFA on those accounts too.</>) },
          { question: "Are the AI-generated suggestions secure?", answer: "The AI suggestions aim to significantly improve upon your input by addressing identified weaknesses (like adding complexity, increasing length, breaking patterns) based on security best practices. They are generally much stronger than typical human-generated passwords. However, achieving perfect, cryptographically secure randomness is challenging for current AI models. For maximum security on critical accounts (like your password manager master password or primary email), using a dedicated password manager's built-in generator to create a fully random, high-entropy password is still the gold standard." },
          { question: "Why does the score sometimes change slightly for the same password?", answer: "Password scoring is complex and relies on algorithms and datasets that evolve. Minor score variations for the exact same password might occasionally occur due to: 1) **Updates to the Analysis Library:** The underlying library (like zxcvbn) might be updated with improved pattern detection or entropy calculations. 2) **Updates to Breach Datasets:** The HIBP database grows, potentially flagging a previously 'safe' password as pwned. 3) **Refinements in Scoring:** We might adjust weighting factors or AI analysis components based on new research or testing. Significant, unexplained jumps are rare." },
          { question: "What security measures are in place for the AI analysis?", answer: "When AI analysis features are used (e.g., interacting with Google Gemini or similar models), the password and related context are transmitted securely over HTTPS to the AI provider's API. We configure these API calls, where possible and supported by the provider, with parameters intended to prevent the logging or storage of the input data on their side. However, the AI provider's own data handling policies ultimately apply. The most sensitive analyses, like core strength scoring (zxcvbn) and breach checks (k-anonymity), remain entirely local within your browser to minimize data exposure." },
          { question: "What's the difference between hashing and encryption?", answer: "They are fundamentally different cryptographic processes: 1) **Hashing:** A one-way function. It takes an input (like a password) and produces a fixed-size string (the hash). You cannot reverse the process to get the original password from the hash. Used for verifying integrity and storing passwords securely (you hash the entered password and compare it to the stored hash). 2) **Encryption:** A two-way function. It uses a key to scramble data (plaintext) into an unreadable format (ciphertext). The same or a related key can be used to decrypt the ciphertext back into the original plaintext. Used for protecting data confidentiality during transmission or storage." },
        ]
    },
    techniques: {
        title: "Password Techniques & Concepts",
        icon: <Key size={16} className="text-inherit" />, // Keep size prop on icon
        items: [
          { question: "What are the most common password cracking techniques?", answer: "Attackers employ a range of methods, often combining them: 1) **Dictionary Attacks:** Using lists of common words, names, phrases, and previously breached passwords. 2) **Brute Force:** Systematically trying every possible combination of characters (inefficient for long passwords but guaranteed to work eventually). 3) **Rule-Based Attacks:** Applying common transformations to dictionary words (e.g., 'password' -> 'P@ssword1!', 'Password2024'). 4) **Pattern Matching:** Targeting predictable human patterns (keyboard walks like 'qwerty', sequences like '123456', common structures like 'WordYear!'). 5) **Credential Stuffing:** The most common attack today; using username/password pairs stolen from one site breach on many other sites. 6) **Rainbow Table Attacks:** Using precomputed tables of hashes to quickly find matches (mitigated by proper salting). 7) **Phishing/Social Engineering:** Tricking users into revealing their passwords directly." },
          { question: "How long should my password be in 2024 and beyond?", answer: "Length is arguably the single most important factor against brute-force attacks. General recommendations: **Minimum 15 characters** for standard online accounts. **20 characters or more** is strongly recommended for critical accounts (email, banking, password manager, cloud storage). For passphrases, aim for **4-6 random words**. Longer is always better, as each additional character exponentially increases the cracking time." },
          { question: "Are passphrases (e.g., 'correct horse battery staple') really secure?", answer: "Yes, *if done correctly*. Long passphrases composed of **randomly chosen, unrelated words** can be extremely secure and often easier to remember than complex shorter strings. The security comes from the **length** and the **randomness** of the word selection (avoid common phrases or predictable sequences). Four truly random common words already offer significant entropy. Adding numbers or symbols enhances them further. Use methods like Diceware for generating truly random passphrases." },
          { question: "How often should I change my passwords?", answer: "Modern security guidance (e.g., from NIST) has moved **away** from mandatory, scheduled password changes (like every 90 days) for most users, as this often leads to weaker, predictable passwords (e.g., 'PasswordSpring24', 'PasswordSummer24'). Instead, the focus is on **strength and uniqueness**. Use a strong, unique password for every account and change it **only when necessary**: 1) If you suspect the account or password has been compromised. 2) After the service announces a data breach involving credentials. 3) If you know you accidentally shared or exposed the password." },
          { question: "What is 'salting' in password hashing?", answer: "Salting is a fundamental technique to protect stored passwords. Before a user's password is hashed, a unique, random string (the 'salt') is generated specifically for that user. This salt is combined with the password, and *then* the result is hashed. The salt itself is stored alongside the hash in the database (it's not secret). When the user logs in, the system retrieves their salt, combines it with the entered password, hashes the combination, and compares it to the stored hash. Salting ensures that even if two users choose the identical password, their stored hashes will be different, rendering precomputed rainbow tables useless." },
          { question: "What's the difference between bcrypt, scrypt, and Argon2?", answer: "These are all modern, adaptive password hashing functions designed to be deliberately slow and resource-intensive, making brute-force attacks much more difficult and expensive for attackers. **bcrypt** is the oldest of the three, widely adopted, and well-tested; it's primarily CPU-intensive. **scrypt** was designed to be significantly more memory-intensive than bcrypt, offering better resistance against custom hardware (ASIC/FPGA) attacks. **Argon2** is the winner of the Password Hashing Competition (2015) and is considered the current state-of-the-art. It's highly configurable, offering strong resistance against GPU cracking and various tradeoffs between memory cost, CPU cost, and parallelism (variants: Argon2d, Argon2i, Argon2id). Argon2id is often the recommended variant today." },
          { question: "Is it safe to let my browser save my passwords?", answer: "Modern browser password managers (Chrome, Firefox, Edge, Safari) have significantly improved their security (using OS-level encryption, sync encryption) and offer great convenience. They are generally **much safer** than reusing passwords or using weak ones. However, dedicated password manager applications (like Bitwarden, 1Password) usually offer more robust features: stronger encryption options for the vault itself, secure sharing, better cross-platform support, storage for secure notes/identities/keys, more advanced breach monitoring, and potentially better isolation from browser-based threats. For highest security, a dedicated manager is often preferred." },
          { question: "What are Passkeys and how do they work?", answer: "Passkeys are a newer, phishing-resistant replacement for passwords based on public-key cryptography (WebAuthn/FIDO standards). When you create a passkey for a site, your device generates a unique pair of keys: a public key stored by the website and a private key stored securely on your device (phone, computer, security key). To log in, the website challenges your device, which uses the private key (unlocked by your fingerprint, face, or PIN) to sign the challenge. The website verifies this signature using your public key. Your private key never leaves your device, making them resistant to phishing and server-side breaches. Adoption is growing rapidly." },
        ]
    },
    threats: {
        title: "Threats & Prevention",
        icon: <ShieldAlert size={16} className="text-inherit" />, // Keep size prop on icon
        items: [
          { question: "What is Phishing?", answer: "Phishing is a type of social engineering attack where attackers impersonate legitimate organizations or individuals (e.g., banks, tech companies, colleagues) via email, text message (smishing), or phone calls (vishing) to trick victims into revealing sensitive information like passwords, credit card numbers, or personal details. They often create a sense of urgency or fear. Key defenses: Be skeptical of unsolicited messages, verify sender identities, never click suspicious links or attachments, and go directly to official websites instead of using links in messages." },
          { question: "What is Social Engineering?", answer: "Social engineering is the art of manipulating people into performing actions or divulging confidential information. Unlike technical hacking, it exploits human psychology – trust, helpfulness, fear, authority, urgency. Phishing is one type, but it also includes pretexting (creating a fabricated scenario), baiting (offering something enticing like a free download containing malware), quid pro quo (offering a service for information), and tailgating (following someone into a secure area). Awareness and skepticism are the best defenses." },
          { question: "What is Malware and how does it steal passwords?", answer: "Malware (Malicious Software) is any software intentionally designed to cause damage or gain unauthorized access. Several types target credentials: 1) **Keyloggers:** Record every keystroke you type, capturing passwords directly. 2) **Spyware:** Monitors your activity, potentially stealing saved passwords or session cookies. 3) **Trojans:** Disguise themselves as legitimate software but contain malicious payloads, including password stealers. 4) **Phishing Malware:** Can redirect you to fake login pages hosted locally or modify browser behavior. Prevention includes using reputable antivirus, keeping software updated, avoiding suspicious downloads/attachments, and being cautious about links." },
          { question: "What is SIM Swapping?", answer: "SIM swapping (or SIM hijacking) is an attack where a fraudster convinces your mobile carrier to transfer your phone number to a SIM card they control. They typically use social engineering or bribe carrier employees. Once they control your number, they can intercept SMS messages, including 2FA codes sent via SMS, allowing them to bypass security and take over accounts linked to that number. This highlights why app-based 2FA or hardware keys are more secure than SMS 2FA." },
          { question: "What should I do if I think my account was compromised?", answer: (<>Act quickly:<ol className="list-decimal pl-6 mt-2 space-y-1 text-sm"><li>Immediately try to log in and **change the password** to a new, strong, unique one.</li><li>If you can log in, **enable Multi-Factor Authentication (MFA)** if it wasn't already, or review/reset existing MFA methods.</li><li>Check account settings for any changes: recovery email/phone, connected apps, email forwarding rules, security questions. Revert any unauthorized changes.</li><li>Review recent account activity for suspicious logins or actions.</li><li>**Log out all other active sessions** if the service offers this option.</li><li>Change the password on **any other site** where you might have reused the compromised password.</li><li>If it's a financial account, contact your bank/institution's fraud department immediately.</li><li>Consider reporting phishing attempts or compromises to the service provider.</li></ol></>) },
        ]
    },
    troubleshooting: {
        title: "Troubleshooting",
        icon: <AlertTriangle size={16} className="text-inherit" />, // Keep size prop on icon
        items: [
          { question: "Why is the 'Time to Crack' estimate different from other tools?", answer: "Password strength estimation isn't standardized. Different tools use different algorithms (e.g., zxcvbn vs. simpler checkers), cracking hardware assumptions (CPU vs. GPU, specific models), datasets for pattern matching, and methodologies for calculating entropy or applying penalties. Our tool aims for realistic estimates based on modern GPU cracking capabilities and comprehensive pattern analysis via zxcvbn. Focus less on the absolute time (which is theoretical) and more on the *relative* strength score (0-4), the specific warnings provided, and whether the password appears in breaches." },
          { question: "The tool seems slow when I type. Why?", answer: "Real-time password analysis, especially the sophisticated pattern matching and entropy calculations performed by libraries like zxcvbn, is computationally intensive. It needs to re-evaluate the entire password structure with every keystroke. Additionally, if AI analysis or debounced breach checks are triggered, these add further processing or network latency. Slower devices or extremely long/complex passwords might naturally experience a slight delay. We strive to optimize performance, but thorough analysis requires processing power." },
          { question: "I'm seeing a network error when checking breaches. What should I do?", answer: "This typically indicates a temporary problem connecting to the external Have I Been Pwned (HIBP) API used for the k-anonymity breach check. Possible causes: 1) Your internet connection is down or unstable. 2) The HIBP API service itself is experiencing temporary downtime or high load (check their status if possible). 3) A browser extension or network firewall is blocking the request. The core password strength analysis (scoring, pattern matching) should still function correctly as it's local. You can try the breach check again later." },
          { question: "Why are AI features sometimes unavailable or giving errors?", answer: "AI features rely on external API services (like Google Gemini). Unavailability or errors can occur due to: 1) **Service Outages:** The AI provider might be experiencing temporary downtime. 2) **API Key Issues:** If the tool relies on an API key, it might be missing, invalid, expired, or have hit rate limits. 3) **Network Connectivity:** Problems connecting from your browser to the AI service's servers. 4) **Content Filtering:** The AI might refuse to process input it deems potentially harmful or against its safety policies. The core, non-AI analysis features should generally remain functional." },
          { question: "How can I report a bug or suggest an improvement?", answer: "We value user feedback! If you encounter a bug, have a suggestion for a new feature, or believe the analysis for a specific password type is inaccurate, please look for a 'Feedback', 'Contact', or 'Report Issue' link or mechanism on the site (e.g., a GitHub repository link if it's open source). Providing details like the password tested (if you're comfortable and it's not sensitive), the results you saw, your browser/OS, and steps to reproduce the issue is extremely helpful for diagnosis and improvement." },
          { question: "Does the tool work offline?", answer: "Yes, the core password strength analysis functionality – including scoring based on length, complexity, pattern matching (via zxcvbn), entropy calculation, and providing feedback/warnings – happens **entirely within your web browser** using JavaScript. It does **not** require an internet connection for these core features. Features that inherently require network access, like the Have I Been Pwned breach check or AI-powered suggestions, will naturally not work offline." },
        ]
    },
};


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

  // --- Reusable Category Button Component (MATCHING SecurityTips) ---
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
        // Base styles (Identical to SecurityTips)
        "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors duration-150",
        "text-sm", // Base text size
        // Conditional styles (Applying font-medium ONLY on active)
        activeCategory === categoryKey
          ? "bg-primary/10 text-primary font-medium" // Active state styles
          : "hover:bg-slate-100/80 text-slate-700" // Hover state styles (no font-medium)
      )}
      onClick={() => setActiveCategory(categoryKey)}
    >
       {/* Icon Span (Rely on icon's size prop, remove w-4 h-4) */}
       <span className={cn(
           "shrink-0", // Basic layout
           activeCategory === categoryKey ? "text-primary" : "text-slate-500" // Conditional color
           // Removed explicit w-4 h-4
        )}>
           {category.icon}
       </span>
       {/* Text Span */}
       <span>{category.title}</span>
    </button>
  );

  // --- Reusable Accordion Item Component ---
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

    return (
      <div
        key={item.question + index}
        className={cn(
          "bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-sm overflow-hidden",
          "transition-all duration-300",
          mounted
            ? `opacity-100 transform translate-y-0`
            : "opacity-0 transform translate-y-4"
        )}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        {/* Trigger Button */}
        <button
          className={cn(
            "flex justify-between items-center w-full p-4 md:p-5 text-left transition-colors duration-150",
            isOpen ? "bg-slate-50/50" : "hover:bg-slate-50/30"
          )}
          onClick={() => toggleItem(categoryKey, index)}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${categoryKey}-${index}`}
        >
          <h3 className="font-medium text-base md:text-lg text-slate-800">{item.question}</h3>
          <div className={cn(
                "ml-4 shrink-0 text-primary transition-transform duration-300 transform",
                isOpen ? "rotate-180" : "rotate-0"
               )}
          >
            <ChevronDown size={18} />
          </div>
        </button>

        {/* Content Panel */}
        <div
          id={`faq-answer-${categoryKey}-${index}`}
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 md:px-5 pb-4 md:pb-5 pt-1 text-muted-foreground text-sm md:text-base">
             {typeof item.answer === 'string' ? (
                <p className="leading-relaxed">{item.answer}</p>
             ) : (
                <div className="leading-relaxed prose prose-sm max-w-none prose-a:text-primary prose-strong:text-slate-700">
                    {item.answer}
                </div>
             )}
          </div>
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
              <div className="space-y-1.5">
                {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
                  <CategoryButton
                    key={key}
                    categoryKey={key}
                    category={category}
                  />
                ))}
              </div>
            </div>

            {/* Accordion Items */}
            <div className="space-y-4">
              {currentCategoryData && currentCategoryData.items.map((item, index) => (
                <AccordionItem
                  key={`${activeCategory}-${index}`}
                  item={item}
                  index={index}
                  categoryKey={activeCategory}
                />
              ))}
            </div>
          </div>
        ) : (
          // --- Desktop Layout (Aligned with SecurityTips) ---
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Desktop Sticky Sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-24 bg-white/30 rounded-xl border border-slate-200/50 p-3 backdrop-blur-sm">
                <div className="space-y-1.5">
                  {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
                    <CategoryButton
                      key={key}
                      categoryKey={key}
                      category={category}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Accordion Items */}
            <div className="md:col-span-3 space-y-4">
              {currentCategoryData && currentCategoryData.items.map((item, index) => (
                <AccordionItem
                  key={`${activeCategory}-${index}`}
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
          <div className="flex justify-center gap-4">
            <Button variant="default" asChild>
                <Link to="/securitytips">Explore Security Tips</Link>
            </Button>
             <Button variant="outline" asChild>
                <Link to="/password">Analyze a Password</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;