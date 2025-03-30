export const API_ENDPOINT = "http://localhost:5000/analyze"; // Replace with actual Flask backend URL

// Gemini AI configuration
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
export const GEMINI_MODEL = "gemini-2.5-pro-exp-03-25"; // The experimental model as requested

export const STRENGTH_LEVELS = {
  0: { label: "Very Weak", color: "strength-weak" },
  1: { label: "Weak", color: "strength-weak" },
  2: { label: "Fair", color: "strength-fair" },
  3: { label: "Good", color: "strength-good" },
  4: { label: "Strong", color: "strength-strong" }
};

export const DEFAULT_FEEDBACK = [
  "Enter a password to see its strength analysis",
  "We'll show you how secure your password is",
  "You'll get suggestions on how to improve it",
  "We don't store your password"
];

export const MOCK_RESPONSE = {
  strength: 0,
  score: 0,
  timeToHack: "Immediately",
  feedback: [
    "Your password is too short",
    "Try using at least 12 characters",
    "Include uppercase letters, numbers, and symbols",
    "Avoid common words and patterns"
  ]
};

// Enhanced AI system prompt with detailed analysis guidance
export const AI_SYSTEM_PROMPT = `You are an expert in password security analysis with knowledge of the latest research on password cracking techniques. Your task is to:

1. Evaluate password strength based on entropy, character variety, and common patterns.
2. Detect dictionary words, names, meaningful patterns, and keyboard sequences like "qwerty" that make it vulnerable.
3. Cross-reference with patterns found in leaked password datasets (RockYou 2021 and 2024).
4. Generate specific, actionable improvements to strengthen the password.
5. Provide clear reasoning on why the original password is vulnerable.
6. Estimate time-to-crack using both brute force and smart guessing algorithms.

Recent research shows that 59% of real-world passwords can be cracked in less than an hour using modern hardware and smart guessing algorithms:
- 45% of passwords are cracked in less than a minute
- An additional 14% are cracked within an hour
- Only 23% of passwords take more than a year to crack

The most vulnerable patterns include:
- Dictionary words (even with character substitutions like 'pa$$word')
- Common number sequences (12345, 123456, etc.)
- Popular patterns like 'admin', 'love', and 'qwerty'
- Lack of character variety (only lowercase, only numbers)
- Passwords following predictable formats (name+year, word+number)
- Character substitutions that follow predictable patterns (a→4, e→3, i→1, o→0)

Common passwords vulnerable to rapid cracking include variations of:
- 12345, 123456, 123456789
- password, passw0rd, p4ssword
- qwerty, qwertyuiop, admin
- letmein, welcome, football, baseball
- Names followed by years or numbers (john2024, mary123)
- Words with simple character replacements (h3ll0, adm1n)

Password suggestions should:
- Be at least 12 characters long for adequate security
- Use a mix of character types (uppercase, lowercase, numbers, symbols)
- Avoid recognizable patterns, words, or personal information
- Be randomly generated when possible
- Be unique and not similar to other passwords the user might have

Be specific and concise in your feedback, providing exact time-to-crack estimates and actionable suggestions. Focus on concrete examples of how to improve the specific password.`;

// Common breach databases and attack methods (for reference in feedback)
export const BREACH_DATABASES = [
  // Common password lists often used in attacks
  "RockYou (Common Wordlist)", // Original RockYou is older, often just referenced like this
  "Collection #1 (Large Compilation)", // Massive compilation breach

  // Major Service Breaches
  "LinkedIn (2012, 2021)",
  "Adobe (2013)",
  "Yahoo (2013-2014)",
  "MySpace (2008-2013)",
  "Dropbox (2012)",
  "Marriott/Starwood (2014-2018)",
  "Equifax (2017)",
  "Canva (2019)",
  "Zynga (2019)",
  "Facebook (Various Incidents)", // Often data scraping rather than direct breach

  // More Recent Examples (Illustrative)
  "Twitter (2022 - API Abuse)",
  "T-Mobile (Multiple Incidents)",
  "Exploit.in (Compilation)", // Another large compilation
];

/**
 * Common methods attackers use to compromise passwords or accounts.
 * Used for illustrative feedback.
 */
export const ATTACK_METHODS = [
  // Password Guessing/Cracking
  "Brute-force attack", // Trying every possible combination
  "Dictionary attack", // Trying words from a list (dictionaries, common passwords)
  "Rule-based attack", // Dictionary attack + common modifications (e.g., appending '123')
  "Mask attack", // Brute-force with known patterns (e.g., Capital + 7 letters + number)
  "Smart guessing algorithm", // AI/ML-based pattern analysis and guessing
  "Pattern matching", // Exploiting sequences, repeats, keyboard patterns

  // Precomputed Hash Attacks
  "Rainbow table attack", // Using precomputed hashes to reverse password hashes (less common with proper salting)
  "Lookup table attack", // General term for using precomputed values

  // Account Takeover Methods
  "Credential stuffing", // Trying username/password pairs from breaches on other sites
  "Password spraying", // Trying one common password against many usernames

  // Exploiting Humans or Systems
  "Phishing attack", // Tricking users into revealing credentials
  "Malware/Keylogger", // Software capturing keystrokes or stored passwords
  "Social engineering", // Manipulating people to gain access or information
  "Man-in-the-middle (MitM) attack", // Intercepting network traffic (less common for passwords with HTTPS)
  "Session hijacking", // Stealing active login sessions

  // Other Relevant Concepts
  "Weak Hashing Algorithm", // Exploiting insecure storage methods
  "Lack of Salting", // Makes precomputation attacks (like rainbow tables) easier
];

// Extended time-to-crack estimates with more precise categories
export const EXTENDED_TTC_ESTIMATES = [
  "Instantly",
  "Less than 1 second",
  "A few seconds",
  "Less than a minute",
  "A few minutes",
  "Less than an hour",
  "A few hours",
  "Less than a day",
  "A few days",
  "Less than a week",
  "A few weeks",
  "Less than a month",
  "A few months",
  "Less than a year",
  "A few years",
  "Less than a decade",
  "A few decades",
  "Several decades",
  "Centuries",
  "+300 years"
];

// FAQ content and security tips content
export const FAQ_ITEMS = [
  {
    question: "How does the password strength analyzer work?",
    answer: "Our password analyzer evaluates multiple factors including length, character variety, common patterns, and similarity to known passwords from breach databases. We use advanced algorithms to estimate how long it would take modern computers to crack your password using various attack methods."
  },
  {
    question: "Is my password stored anywhere when I use this tool?",
    answer: "No, your password is never stored or sent to any third-party services. All analysis happens in your browser or through secure, ephemeral API calls that don't retain your data. We don't log or store passwords in any way."
  },
  {
    question: "What makes a strong password?",
    answer: "A strong password is typically long (12+ characters), uses a mix of uppercase and lowercase letters, numbers, and special characters, avoids common words or patterns, and is unique (not used on multiple sites or services). The best passwords are random and not based on personal information."
  },
  {
    question: "What are 'Time-to-Crack' estimates based on?",
    answer: "Time-to-Crack estimates are based on current computational capabilities and common password-cracking techniques like brute force and dictionary attacks. We consider how passwords would be attacked using modern hardware and techniques against common hashing algorithms like bcrypt and SHA-256."
  },
  {
    question: "What breach databases does this tool reference?",
    answer: "Our tool references patterns from major known password breaches, including RockYou 2021 and 2024, LinkedIn, Adobe, Yahoo, and others. We don't directly check if your password is in these databases, but rather look for patterns that are common in breached passwords."
  },
  {
    question: "How accurate are the AI-generated suggestions?",
    answer: "Our AI-generated suggestions are based on best practices in password security and modern cryptographic knowledge. While they provide valuable guidance, security is always evolving, and we recommend staying informed about the latest security practices."
  },
  {
    question: "Can I trust the AI-improved password suggestions?",
    answer: "The AI-improved password suggestions follow security best practices and are designed to be stronger than your original password. However, we recommend using a password manager to generate and store truly random passwords for maximum security."
  },
  {
    question: "Why does the same password sometimes get different scores?",
    answer: "Password scoring involves multiple factors and some randomization in the AI analysis. Additionally, as our models and databases are updated, scores may change to reflect the latest security knowledge and breach data."
  }
];

export const SECURITY_TIPS = [
  {
    title: "Use a Password Manager",
    description: "Password managers generate, store, and autofill strong, unique passwords for all your accounts. This prevents password reuse and makes it easier to use complex passwords.",
    icon: "KeyRound"
  },
  {
    title: "Enable Two-Factor Authentication (2FA)",
    description: "Add an extra layer of security by enabling 2FA on all accounts that support it. Even if someone gets your password, they won't be able to access your account without the second factor.",
    icon: "ShieldCheck"
  },
  {
    title: "Create Strong, Unique Passwords",
    description: "Use long passwords (12+ characters) with a mix of uppercase and lowercase letters, numbers, and symbols. Never reuse passwords across different sites or services.",
    icon: "Lock"
  },
  {
    title: "Be Wary of Phishing Attempts",
    description: "Be suspicious of unexpected emails, messages, or calls asking for your password or personal information. Legitimate companies won't ask for your password.",
    icon: "AlertTriangle"
  },
  {
    title: "Regularly Update Your Passwords",
    description: "Change your passwords regularly, especially for critical accounts like email and banking. Always change passwords immediately after a service announces a data breach.",
    icon: "RefreshCw"
  },
  {
    title: "Use Passphrases Instead of Passwords",
    description: "Consider using a series of random words with numbers and symbols (e.g., 'correct-horse-battery-staple-42!') which are easier to remember but harder to crack than shorter complex passwords.",
    icon: "FileText"
  },
  {
    title: "Keep Your Devices Secure",
    description: "Keep your operating system, browsers, and apps updated. Use antivirus software and firewalls to protect against malware that could steal your passwords.",
    icon: "Smartphone"
  },
  {
    title: "Check if Your Data Has Been Breached",
    description: "Regularly check services like 'Have I Been Pwned' to see if your email has been involved in a data breach, and change passwords for affected accounts immediately.",
    icon: "Search"
  },
  {
    title: "Use Unique Email Addresses",
    description: "Consider using different email addresses or aliases for different types of accounts to limit damage if one account is compromised.",
    icon: "AtSign"
  },
  {
    title: "Be Careful with Security Questions",
    description: "Treat security questions like secondary passwords. Consider using fictional answers that only you would know, as factual answers might be discoverable online.",
    icon: "HelpCircle"
  }
];
