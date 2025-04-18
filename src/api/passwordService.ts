import { MOCK_RESPONSE, BREACH_DATABASES, ATTACK_METHODS /*, EXTENDED_TTC_ESTIMATES is not used here */ } from "@/constants/config";
import { calculatePasswordStatistics } from "@/utils/formatTTC"; // Ensure this path is correct
import { analyzePasswordWithOllama, type AiAnalysisResult, type PasswordAnalysisContext } from "@/api/ollamaService";
// import { analyzePasswordWithGemini } from "@/api/geminiService"; // Keep for potential future use

// Read the environment variable (will be undefined if not set, defaulting to Gemini path)
// const modelSource = import.meta.env.VITE_MODEL_SOURCE || 'gemini'; // Default to gemini if not set
export interface HibpCheckResponse {
  password_provided: boolean;
  check_method: string;
  pwned: boolean; // The crucial field
  status_message: string;
}
// --- NEW FUNCTION ---
/**
 * Checks a password against the backend's offline HIBP database.
 * @param password The password string to check.
 * @returns Promise resolving to the HIBP check result.
 */
export async function checkPasswordHibp(password: string): Promise<HibpCheckResponse> {
  // Ensure your backend URL is correct (consider using an environment variable)
  const backendUrl = "http://127.0.0.1:8000"; // Or process.env.REACT_APP_API_URL
  const apiUrl = `${backendUrl}/hibp/check-password/?password=${encodeURIComponent(password)}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // Add any other headers if required by your backend (e.g., API keys)
      },
    });

    if (!response.ok) {
      // Try to get error details from the backend response body
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetails += ` - ${errorData.detail || JSON.stringify(errorData)}`;
      } catch (jsonError) {
        // If parsing JSON fails, use the status text
        errorDetails += ` - ${response.statusText}`;
      }
      console.error("HIBP Check API Error Details:", errorDetails);
      throw new Error(`HIBP check failed: ${response.status}`);
    }

    const data: HibpCheckResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Error calling HIBP check API:", error);
    // Re-throw a more specific error or handle it as needed
    if (error instanceof Error && error.message.startsWith('HIBP check failed')) {
      throw error; // Re-throw specific HTTP errors
    }
    throw new Error("Network error or failed to connect to HIBP service.");
  }
}
// --- Hashcat Cracker Types and Function ---

// Request model mirroring backend's CrackRequest
export interface HashcatCrackRequest {
  hash_value: string;
  hash_mode: number;
  wordlist_filename: string;
}

// Response model mirroring backend's CrackResponse
export interface HashcatCrackResponse {
  status: 'success' | 'failed' | 'error'; // More specific type
  cracked_password?: string | null;
  hash_value: string;
  hash_mode: number;
  wordlist_used: string;
  elapsed_time_seconds?: number | null;
  message: string;
  hashcat_output?: string | null; // Optional full output
}

/**
 * Sends a hash cracking request to the backend Hashcat service.
 * @param request The cracking request details (hash, mode, wordlist).
 * @returns Promise resolving to the cracking result.
 */
export async function crackHashWithHashcat(request: HashcatCrackRequest): Promise<HashcatCrackResponse> {
  const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"; // Use env var
  const apiUrl = `${backendUrl}/hashcat/crack`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        // Use the detail field from FastAPI's HTTPException or the message from CrackResponse
        errorDetails += ` - ${errorData.detail || errorData.message || JSON.stringify(errorData)}`;
      } catch (jsonError) {
        errorDetails += ` - ${response.statusText}`;
      }
      console.error("Hashcat Crack API Error Details:", errorDetails);
      // Throw the detailed error message
      throw new Error(`Hashcat crack request failed: ${errorDetails}`);
    }

    const data: HashcatCrackResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Error calling Hashcat crack API:", error);
    // Re-throw specific errors or a generic one
    if (error instanceof Error && error.message.startsWith('Hashcat crack request failed')) {
      throw error;
    }
    throw new Error("Network error or failed to connect to Hashcat service.");
  }
}
/**
 * API Switcher: Decides which AI service to call based on environment variable.
 * NOTE: This function is currently bypassed by the usePasswordAnalysis hook,
 *       which calls analyzePasswordWithOllama directly.
 */
export async function analyzePasswordAPI(
  password: string, 
  analysisContext: PasswordAnalysisContext
): Promise<AiAnalysisResult> {
  // console.log("Routing AI analysis to Ollama (hardcoded)...");
  return analyzePasswordWithOllama(password, analysisContext);
  // REMOVED: Conditional logic for Gemini
}
// Password analysis response type
export type PasswordAnalysisResponse = {
  strength: number; // 0-4 strength score
  score: number; // Raw score (0-100)
  timeToHack: string; // Estimated time to crack
  timeToHackSmart: string; // Estimated time to crack with smart guessing
  entropy: number; // Password entropy in bits
  feedback: string[]; // Array of feedback messages
  statistics: {
    characterTypes: {
      lowercase: boolean;
      uppercase: boolean;
      numbers: boolean;
      symbols: boolean;
      count: number;
    },
    hasCommonPatterns: boolean;
    hasSequentialChars: boolean;
    hasRepeatedChars: boolean;
  };
  hardwareEstimates?: {
    cpu: string;
    normalGpu: string;
    highEndGpu: string;
  };
};

// Check if we're in development environment
const isDev = process.env.NODE_ENV === "development";

/**
 * Analyzes a password using ONLY local, client-side calculations.
 */
export async function analyzePassword(password: string): Promise<PasswordAnalysisResponse> {
  await new Promise(resolve => setTimeout(resolve, 10)); // Tiny delay for async consistency

  try {
    // Handle empty password
    if (!password) {
      return {
        strength: 0, score: 0, timeToHack: "Instantly", timeToHackSmart: "Instantly", entropy: 0,
        feedback: ["Enter a password to see its strength"],
        statistics: {
          characterTypes: { lowercase: false, uppercase: false, numbers: false, symbols: false, count: 0 },
          hasCommonPatterns: false, hasSequentialChars: false, hasRepeatedChars: false
        },
        hardwareEstimates: { cpu: "N/A", normalGpu: "N/A", highEndGpu: "N/A" }
      };
    }

    // Optional: Mock data logic
    if (isDev && false) { // Set to true to use mock data
      console.warn("Using DEV mock data for basic password analysis.");
      await new Promise(resolve => setTimeout(resolve, 500));
      const strength = Math.min(4, Math.floor(password.length / 3));
      return {
        strength, score: strength * 25, timeToHack: `Mock ${strength}`, timeToHackSmart: `MockSmart ${strength}`, entropy: password.length * 4,
        feedback: [`Mock feedback str ${strength}`],
        // FIX: Provide a valid mock statistics object
        statistics: {
            characterTypes: { lowercase: true, uppercase: strength > 1, numbers: strength > 2, symbols: strength > 3, count: 1 + (strength > 1 ? 1:0) + (strength > 2 ? 1:0) + (strength > 3 ? 1:0) },
            hasCommonPatterns: strength < 2,
            hasSequentialChars: strength < 1,
            hasRepeatedChars: strength < 1
        },
        hardwareEstimates: { cpu: "MockCPU", normalGpu: "MockGPU", highEndGpu: "MockHiGPU" }
      };
      // The code after return is unreachable, but the 'return' itself makes the function valid.
    }

    // --- Perform local analysis directly ---
    // console.log("Performing local analysis for basic metrics using generateAdvancedAnalysis.");
    // generateAdvancedAnalysis should now return the complete PasswordAnalysisResponse structure
    const analysisResult = generateAdvancedAnalysis(password);

    // REMOVED: Redundant check for hardwareEstimates, should be handled within generateAdvancedAnalysis

    return analysisResult;

  } catch (error) {
    console.error("Error during local password analysis (generateAdvancedAnalysis):", error);
    // Return a consistent error response structure
    return {
      strength: 0, score: 0, timeToHack: "Error", timeToHackSmart: "Error", entropy: 0,
      feedback: ["Could not analyze password locally", error instanceof Error ? error.message : "Unknown error"],
      statistics: {
        characterTypes: { lowercase: false, uppercase: false, numbers: false, symbols: false, count: 0 },
        hasCommonPatterns: false, hasSequentialChars: false, hasRepeatedChars: false
      },
      hardwareEstimates: { cpu: "Error", normalGpu: "Error", highEndGpu: "Error" }
    };
  }
}
/**
 * Check if a password is potentially in a breach database
 * (Note: This is a client-side estimation only - not a real breach check)
 */
export async function checkPasswordBreached(password: string): Promise<{
  isPotentiallyBreached: boolean;
  confidence: number; // 0-100
  databases: string[];
  attackMethods: string[];
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500)); // Shorter delay

  if (!password) {
    return {
      isPotentiallyBreached: false,
      confidence: 0,
      databases: [],
      attackMethods: []
    };
  }
  
  // Calculate password statistics
  const stats = calculatePasswordStatistics(password);
  
  // Check for common patterns in breach databases
  const hasCommonPattern = /123|password|admin|welcome|qwerty|letmein|football|baseball|dragon/i.test(password);
  const isShort = password.length < 8;
  const isSimple = stats.characterTypes.count <= 1; // Only one character type
  
  // More sophisticated pattern detection
  const commonPasswords = [
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567", 
    "letmein", "trustno1", "dragon", "baseball", "111111", "iloveyou", "master", 
    "sunshine", "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", 
    "superman", "qazwsx", "michael", "football", "welcome", "jesus", "ninja", 
    "mustang", "password1", "123456789", "adobe123", "admin", "1234567890", "photoshop",
    "azerty", "000000", "princess", "qwertyuiop"
  ];
  
  const isCommonPassword = commonPasswords.some(p => 
    password.toLowerCase() === p || 
    // Check for simple character substitutions (like 'a' to '@', 's' to '$')
    password.toLowerCase().replace('@', 'a').replace('$', 's').replace('0', 'o').replace('1', 'i') === p
  );
  
  // Determine breach probability
  let confidence = 0;
  
  if (isCommonPassword) {
    confidence = 0.95; // Very high confidence for exact matches
  } else if (hasCommonPattern) {
    confidence = 0.8; // High confidence for common patterns
  } else if (isShort && isSimple) {
    confidence = 0.7; // High confidence for short, simple passwords
  } else if (isShort) {
    confidence = 0.6; // Moderate confidence for short passwords
  } else if (isSimple) {
    confidence = 0.5; // Moderate confidence for simple passwords
  } else if (stats.hasSequentialChars) {
    confidence = 0.4; // Some confidence for sequential characters
  } else if (stats.hasRepeatedChars) {
    confidence = 0.3; // Some confidence for repeated characters
  } else {
    // Base confidence on character types and entropy
    confidence = Math.max(0.1, Math.min(0.3, 1 - (stats.entropy / 100)));
  }
  
  // Introduce randomness for demo purposes, but make it deterministic based on the password
  const seedValue = password.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const pseudoRandom = (seedValue % 100) / 100; // Value between 0 and 1
  
  const isPotentiallyBreached = pseudoRandom < confidence || isCommonPassword;
  
  // Select relevant breach databases for demo
  const numDatabases = isPotentiallyBreached ? Math.min(3, Math.floor(confidence * 5) + 1) : 0;
  
  // Ensure deterministic selection based on password
  let databases: string[] = [];
  if (isPotentiallyBreached && numDatabases > 0) {
    // Sort databases by their name length + first character code for deterministic ordering
    const sortedDatabases = [...BREACH_DATABASES].sort((a, b) => {
      const scoreA = a.length + a.charCodeAt(0);
      const scoreB = b.length + b.charCodeAt(0);
      return scoreA - scoreB;
    });
    
    // Select databases based on the seed value
    const startIndex = seedValue % sortedDatabases.length;
    for (let i = 0; i < numDatabases; i++) {
      databases.push(sortedDatabases[(startIndex + i) % sortedDatabases.length]);
    }
  }
  
  // Select potential attack methods
  const attackMethods = [];
  if (isPotentiallyBreached) {
    if (stats.hasCommonPatterns || isCommonPassword) {
      attackMethods.push("Dictionary attack");
      attackMethods.push("Smart guessing algorithm");
    }
    
    if (stats.hasSequentialChars) {
      attackMethods.push("Pattern matching");
    }
    
    if (isSimple) {
      attackMethods.push("Brute force attack");
    }
    
    if (attackMethods.length === 0) {
      attackMethods.push(ATTACK_METHODS[seedValue % ATTACK_METHODS.length]);
    }
  }
  
  // Ensure unique values
  databases = [...new Set(databases)];
  const uniqueAttackMethods = [...new Set(attackMethods)];
  
  return {
    isPotentiallyBreached,
    confidence: Math.round(confidence * 100),
    databases,
    attackMethods: uniqueAttackMethods
  };
}

/**
 * Generates an advanced password analysis
 */
function generateAdvancedAnalysis(password: string): PasswordAnalysisResponse {
  // Get password statistics
  const stats = calculatePasswordStatistics(password);
  
  // Determine strength based on entropy and patterns
  let strength = 0;
  if (stats.entropy >= 80) {
    strength = 4; // Strong
  } else if (stats.entropy >= 60) {
    strength = 3; // Good
  } else if (stats.entropy >= 40) {
    strength = 2; // Fair
  } else if (stats.entropy >= 20) {
    strength = 1; // Weak
  } else {
    strength = 0; // Very Weak
  }
  
  // Apply penalties for common patterns
  if (stats.hasCommonPatterns) strength = Math.max(0, strength - 2);
  if (stats.hasSequentialChars) strength = Math.max(0, strength - 1);
  if (stats.hasRepeatedChars) strength = Math.max(0, strength - 1);
  
  // Calculate normalized score (0-100)
  const baseScore = Math.min(100, Math.round((stats.entropy / 100) * 100));
  const score = Math.max(0, baseScore - (stats.hasCommonPatterns ? 30 : 0) - 
    (stats.hasSequentialChars ? 15 : 0) - (stats.hasRepeatedChars ? 15 : 0));
  
  // Generate feedback
  const feedback = generateAdvancedFeedback(password, strength, stats);
  
  return {
    strength,
    score,
    timeToHack: stats.estimatedCrackTime.bruteForce,
    timeToHackSmart: stats.estimatedCrackTime.smartGuessing,
    entropy: stats.entropy,
    feedback,
    statistics: {
      characterTypes: stats.characterTypes,
      hasCommonPatterns: stats.hasCommonPatterns,
      hasSequentialChars: stats.hasSequentialChars,
      hasRepeatedChars: stats.hasRepeatedChars
    }
  };
}

/**
 * Generates advanced feedback based on password analysis
 */
function generateAdvancedFeedback(password: string, strength: number, stats: any): string[] {
  const feedback = [];
  
  // Length feedback
  if (password.length < 8) {
    feedback.push("Your password is too short");
    feedback.push("Use at least 8 characters, preferably 12+");
  } else if (password.length < 12) {
    feedback.push("Your password could be longer");
    feedback.push("For better security, use at least 12 characters");
  }
  
  // Character variety feedback
  if (stats.characterTypes.count < 3) {
    feedback.push(`Use more character types (currently using ${stats.characterTypes.count}/4 types)`);
    
    if (!stats.characterTypes.uppercase) {
      feedback.push("Add uppercase letters (A-Z)");
    }
    
    if (!stats.characterTypes.numbers) {
      feedback.push("Include numbers (0-9)");
    }
    
    if (!stats.characterTypes.symbols) {
      feedback.push("Add special characters (!, @, #, etc.)");
    }
  }
  
  // Pattern feedback
  if (stats.hasCommonPatterns) {
    feedback.push("Avoid common words like 'password' or 'admin'");
    feedback.push(`This pattern appears in the ${BREACH_DATABASES[0]} breach dataset`);
  }
  
  if (stats.hasSequentialChars) {
    feedback.push("Avoid sequential patterns like '123' or 'abc'");
  }
  
  if (stats.hasRepeatedChars) {
    feedback.push("Avoid repeating characters (like 'aaa')");
  }
  
  // Smart guessing feedback based on stats
  if (stats.estimatedCrackTime.smartGuessing === "Instantly" || 
      stats.estimatedCrackTime.smartGuessing === "Less than a minute" || 
      stats.estimatedCrackTime.smartGuessing === "A few minutes") {
    feedback.push("Smart algorithms can crack this password quickly");
    
    // Add a specific attack method mention
    const attackMethod = ATTACK_METHODS[Math.floor(Math.random() * 3)]; // Choose from first 3 attack methods
    feedback.push(`Vulnerable to ${attackMethod}`);
  }
  
  // Positive feedback for strong passwords
  if (strength >= 3) {
    feedback.push("Good job! Your password is strong");
  }
  
  if (strength === 4) {
    feedback.push("Excellent password strength!");
  }
  
  // Real-world context
  if (strength <= 2) {
    feedback.push("59% of real passwords are cracked within an hour");
  }
  
  // If we have too few feedback items, add generic ones
  if (feedback.length < 2) {
    feedback.push("Consider using a password manager for maximum security");
    feedback.push("Even strong passwords should be unique for each site");
  }
  
  // Add entropy information
  feedback.push(`Entropy: ${stats.entropy.toFixed(1)} bits (higher is better)`);
  
  return feedback.slice(0, 5); // Return at most 5 feedback items
}
