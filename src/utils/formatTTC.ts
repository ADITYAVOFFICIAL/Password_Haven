// Utility functions for time-to-crack (TTC) calculations and formatting

/**
 * Formats a time-to-crack string into a more readable format
 */
export function formatTimeToHack(ttc: string): string {
  if (!ttc) return "N/A";
  
  // If the time is already formatted with specific time units, return it
  if (ttc.includes("years") || ttc.includes("months") || ttc.includes("weeks") || 
      ttc.includes("days") || ttc.includes("hours") || ttc.includes("minutes") || 
      ttc.includes("seconds")) {
    // For times over 300 years, standardize to "+300 years"
    if (ttc.includes("years") && parseInt(ttc) > 300) {
      return "+300 years";
    }
    return ttc;
  }
  
  // Handle specific cases for more precise times
  if (ttc === "Instantly" || ttc === "Less than a second") {
    return "Instantly";
  }

  if (ttc === "+300 years" || ttc === "centuries" || ttc === "centuries+") {
    return "+300 years";
  }
  
  // Try to parse if it looks like a time string
  try {
    // Convert time string to more readable format
    return parseTimeString(ttc);
  } catch (e) {
    // If we can't parse it, return the original
    return ttc;
  }
}

/**
 * Attempts to parse a time string into a more readable format
 */
function parseTimeString(timeStr: string): string {
  // For simple strings without numbers, just return them
  if (!/\d/.test(timeStr)) {
    return timeStr;
  }
  
  // Try to parse more complex time strings
  if (timeStr.includes("years") || timeStr.includes("year")) {
    const years = parseInt(timeStr);
    if (years > 300) return "+300 years";
    if (years === 1) return "1 year";
    return `${years} years`;
  }
  
  if (timeStr.includes("months") || timeStr.includes("month")) {
    const months = parseInt(timeStr);
    if (months === 1) return "1 month";
    return `${months} months`;
  }
  
  if (timeStr.includes("weeks") || timeStr.includes("week")) {
    const weeks = parseInt(timeStr);
    if (weeks === 1) return "1 week";
    return `${weeks} weeks`;
  }
  
  if (timeStr.includes("days") || timeStr.includes("day")) {
    const days = parseInt(timeStr);
    if (days === 1) return "1 day";
    return `${days} days`;
  }
  
  if (timeStr.includes("hours") || timeStr.includes("hour")) {
    const hours = parseInt(timeStr);
    if (hours === 1) return "1 hour";
    return `${hours} hours`;
  }
  
  if (timeStr.includes("minutes") || timeStr.includes("minute")) {
    const minutes = parseInt(timeStr);
    if (minutes === 1) return "1 minute";
    return `${minutes} minutes`;
  }
  
  if (timeStr.includes("seconds") || timeStr.includes("second")) {
    const seconds = parseInt(timeStr);
    if (seconds === 1) return "1 second";
    if (seconds < 1) return "Less than a second";
    return `${seconds} seconds`;
  }
  
  // Return original if we couldn't parse it
  return timeStr;
}

/**
 * Calculate password statistics
 */
export function calculatePasswordStatistics(password: string) {
  if (!password) {
    return {
      entropy: 0,
      characterTypes: {
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
        count: 0
      },
      hasCommonPatterns: false,
      hasSequentialChars: false,
      hasRepeatedChars: false,
      estimatedCrackTime: {
        bruteForce: "Instantly",
        smartGuessing: "Instantly",
        hardwareEstimates: {
          cpu: "Instantly",
          normalGpu: "Instantly",
          highEndGpu: "Instantly"
        }
      }
    };
  }
  
  // Analyze character types
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  
  // Count character types
  const charTypeCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
  
  // Statistics for character distribution
  const charStats = {
    lowercase: 0,
    uppercase: 0,
    numbers: 0,
    symbols: 0,
    other: 0
  };
  
  for (const char of password) {
    if (/[a-z]/.test(char)) {
      charStats.lowercase++;
    } else if (/[A-Z]/.test(char)) {
      charStats.uppercase++;
    } else if (/[0-9]/.test(char)) {
      charStats.numbers++;
    } else if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(char)) {
      charStats.symbols++;
    } else {
      charStats.other++;
    }
  }
  
  // Calculate effective pool size (for entropy calculation)
  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 33; // Common symbols count
  
  // Default to lowercase if no character types detected
  if (poolSize === 0) poolSize = 26;
  
  // Calculate entropy
  const entropy = Math.log2(Math.pow(poolSize, password.length));
  
  // Detect common patterns
  // Check for sequential characters
  const hasSequentialChars = checkForSequentialChars(password);
  
  // Check for repeated characters
  const hasRepeatedChars = checkForRepeatedChars(password);
  
  // Check for common patterns
  const hasCommonPatterns = checkForCommonPatterns(password);
  
  // Calculate estimated crack times
  const estimatedCrackTime = calculateCrackTime(password.length, poolSize, hasCommonPatterns, hasSequentialChars, hasRepeatedChars);
  
  return {
    entropy,
    characterTypes: {
      lowercase: hasLowercase,
      uppercase: hasUppercase,
      numbers: hasNumbers,
      symbols: hasSymbols,
      count: charTypeCount
    },
    charStats,
    hasCommonPatterns,
    hasSequentialChars,
    hasRepeatedChars,
    estimatedCrackTime
  };
}

/**
 * Check for sequential characters
 */
function checkForSequentialChars(password: string): boolean {
  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
  ];
  
  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      const pattern = seq.substring(i, i + 3);
      if (password.includes(pattern)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check for repeated characters
 */
function checkForRepeatedChars(password: string): boolean {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check for common patterns in the password
 */
function checkForCommonPatterns(password: string): boolean {
  const lowerPass = password.toLowerCase();
  
  // Common words
  const commonWords = [
    "password", "admin", "welcome", "login", "user", 
    "qwerty", "test", "letmein", "summer", "winter", 
    "spring", "autumn", "dragon", "baseball", "football", 
    "monkey", "superman", "batman", "trustno1", "master"
  ];
  
  for (const word of commonWords) {
    if (lowerPass.includes(word)) {
      return true;
    }
  }
  
  // Common patterns
  const patterns = [
    /^[a-zA-Z]+\d{2,4}$/, // word followed by 2-4 digits (often a year)
    /^[a-zA-Z]+\d{1,2}$/, // word followed by 1-2 digits
    /^\d{4,8}$/, // just 4-8 digits
    /^(19|20)\d{2}$/, // year format (19XX or 20XX)
    /^[a-zA-Z]+[!@#$%^&*]$/, // word followed by a single symbol
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(password)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate estimated time to crack a password
 */
function calculateCrackTime(length: number, poolSize: number, hasCommonPatterns: boolean, hasSequentialChars: boolean, hasRepeatedChars: boolean) {
  // Base calculations - these are simplified estimates
  // Assuming modern hardware can check about 10 billion hashes per second for brute force
  const hashesPerSecond = 10000000000; // 10 billion
  
  // Calculate possible combinations
  const combinations = Math.pow(poolSize, length);
  
  // Average time (in seconds) to crack with brute force
  // Dividing by 2 because on average, a brute force attack finds the password halfway through
  let bruteForceTimeInSeconds = combinations / hashesPerSecond / 2;
  
  // Smart guessing is much faster for common patterns - adjust based on patterns
  let smartGuessingFactor = 1;
  
  if (hasCommonPatterns) {
    smartGuessingFactor *= 1000000; // Massively reduces time if common patterns
  }
  
  if (hasSequentialChars) {
    smartGuessingFactor *= 1000; // Significantly reduces time if sequential chars
  }
  
  if (hasRepeatedChars) {
    smartGuessingFactor *= 100; // Reduces time if repeated chars
  }
  
  // Length under 8 is a significant weakness
  if (length < 8) {
    smartGuessingFactor *= 10000;
  }
  
  // Adjust for character type count - more variety = harder to crack with smart guessing
  if (poolSize < 26) {
    smartGuessingFactor *= 10000; // Only lowercase or only numbers is very weak
  } else if (poolSize < 36) {
    smartGuessingFactor *= 1000; // Lowercase + numbers is still relatively weak
  } else if (poolSize < 62) {
    smartGuessingFactor *= 100; // Missing symbols makes it somewhat weaker
  }
  
  // Smart guessing time calculation
  const smartGuessingTimeInSeconds = Math.max(bruteForceTimeInSeconds / smartGuessingFactor, 0.001);
  
  // Calculate hardware-specific estimates
  // Standard bcrypt cost=12 hash rates
  const CPU_HASH_RATE = 45; // CPU bcrypt (cost=12) ~45-60 h/s on modern CPU
const NORMAL_GPU_HASH_RATE = 1900; // RTX 3060 bcrypt (cost=12) ~1800-2000 h/s
const HIGH_END_GPU_HASH_RATE = 24000; // RTX 4090 bcrypt (cost=12) ~24000 h/s
  
  let cpuTimeInSeconds = combinations / CPU_HASH_RATE / 2;
  let normalGpuTimeInSeconds = combinations / NORMAL_GPU_HASH_RATE / 2;
  let highEndGpuTimeInSeconds = combinations / HIGH_END_GPU_HASH_RATE / 2;
  
  // Adjust based on patterns
  if (hasCommonPatterns) {
    const factor = 1000000;
    cpuTimeInSeconds = cpuTimeInSeconds / factor;
    normalGpuTimeInSeconds = normalGpuTimeInSeconds / factor;
    highEndGpuTimeInSeconds = highEndGpuTimeInSeconds / factor;
  }
  
  if (hasSequentialChars) {
    const factor = 1000;
    cpuTimeInSeconds = cpuTimeInSeconds / factor;
    normalGpuTimeInSeconds = normalGpuTimeInSeconds / factor;
    highEndGpuTimeInSeconds = highEndGpuTimeInSeconds / factor;
  }
  
  if (hasRepeatedChars) {
    const factor = 100;
    cpuTimeInSeconds = cpuTimeInSeconds / factor;
    normalGpuTimeInSeconds = normalGpuTimeInSeconds / factor;
    highEndGpuTimeInSeconds = highEndGpuTimeInSeconds / factor;
  }
  
  return {
    bruteForce: formatTime(bruteForceTimeInSeconds),
    smartGuessing: formatTime(smartGuessingTimeInSeconds),
    hardwareEstimates: {
      cpu: formatTime(cpuTimeInSeconds),
      normalGpu: formatTime(normalGpuTimeInSeconds),
      highEndGpu: formatTime(highEndGpuTimeInSeconds)
    }
  };
}

/**
 * Format time from seconds to a human-readable string
 */
function formatTime(seconds: number): string {
  if (seconds < 0.001) {
    return "Instantly";
  }
  
  if (seconds < 1) {
    return "Less than a second";
  }
  
  if (seconds < 60) {
    const roundedSeconds = Math.round(seconds);
    return `${roundedSeconds} ${roundedSeconds === 1 ? 'second' : 'seconds'}`;
  }
  
  if (seconds < 60 * 60) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  if (seconds < 60 * 60 * 24) {
    const hours = Math.round(seconds / (60 * 60));
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  if (seconds < 60 * 60 * 24 * 7) {
    const days = Math.round(seconds / (60 * 60 * 24));
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  
  if (seconds < 60 * 60 * 24 * 30) {
    const weeks = Math.round(seconds / (60 * 60 * 24 * 7));
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  
  if (seconds < 60 * 60 * 24 * 365) {
    const months = Math.round(seconds / (60 * 60 * 24 * 30));
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  
  const years = Math.round(seconds / (60 * 60 * 24 * 365));
  if (years > 300) {
    return "+300 years";
  }
  
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}
