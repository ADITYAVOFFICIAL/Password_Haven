
import { useState, useEffect } from "react";
import { analyzePassword, type PasswordAnalysisResponse, checkPasswordBreached,checkPasswordHibp,type HibpCheckResponse,crackHashWithHashcat,type HashcatCrackRequest,type HashcatCrackResponse } from "@/api/passwordService";
// import { analyzePasswordWithGemini } from "@/api/geminiService";
import { analyzePasswordWithOllama, type PasswordAnalysisContext } from "@/api/ollamaService";
import { DEFAULT_FEEDBACK } from "@/constants/config";
import { calculatePasswordStatistics } from "@/utils/formatTTC";
import { analyzePasswordAdvanced } from "@/utils/passwordAnalysis";
import { calculateMD5 } from "@/utils/hashing";
export function usePasswordAnalysis() {
  // --- NEW HIBP STATE ---
  const [hibpResult, setHibpResult] = useState<HibpCheckResponse | null>(null);
  const [isHibpLoading, setIsHibpLoading] = useState(false);
  const [hibpError, setHibpError] = useState<string | null>(null); // Optional error state
  // --- Hashcat State ---
  const [hashcatResult, setHashcatResult] = useState<HashcatCrackResponse | null>(null);
  const [isHashcatLoading, setIsHashcatLoading] = useState(false);
  const [hashcatError, setHashcatError] = useState<string | null>(null);
  // --- END NEW HIBP STATE ---
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState<PasswordAnalysisResponse>({
    strength: 0,
    score: 0,
    timeToHack: "",
    timeToHackSmart: "",
    entropy: 0,
    feedback: DEFAULT_FEEDBACK,
    statistics: {
      characterTypes: {
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
        count: 0
      },
      hasCommonPatterns: false,
      hasSequentialChars: false,
      hasRepeatedChars: false
    },
    hardwareEstimates: {
      cpu: "",
      normalGpu: "",
      highEndGpu: ""
    }
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<{
    suggestions: string[];
    reasoning: string[];
    improvedPassword: string;
  }>({
    suggestions: [],
    reasoning: [],
    improvedPassword: ""
  });
  
  const [breachAnalysis, setBreachAnalysis] = useState<{
    isPotentiallyBreached: boolean;
    confidence: number;
    databases: string[];
    attackMethods: string[];
    checked: boolean;
  }>({
    isPotentiallyBreached: false,
    confidence: 0,
    databases: [],
    attackMethods: [],
    checked: false
  });
  
  const [advancedAnalysis, setAdvancedAnalysis] = useState<any>(null);
  const [stats, setStats] = useState(() => calculatePasswordStatistics(""));
  const [passwordStats, setPasswordStats] = useState({
    length: 0,
    uppercase: 0,
    lowercase: 0,
    numbers: 0,
    symbols: 0,
    other: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isBreachLoading, setIsBreachLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Don't run analysis on empty password
    if (!password) {
      setAnalysis({
        strength: 0,
        score: 0,
        timeToHack: "",
        timeToHackSmart: "",
        entropy: 0,
        feedback: DEFAULT_FEEDBACK,
        statistics: {
          characterTypes: {
            lowercase: false,
            uppercase: false,
            numbers: false,
            symbols: false,
            count: 0
          },
          hasCommonPatterns: false,
          hasSequentialChars: false,
          hasRepeatedChars: false
        },
        hardwareEstimates: {
          cpu: "",
          normalGpu: "",
          highEndGpu: ""
        }
      });
      setAiAnalysis({
        suggestions: [],
        reasoning: [],
        improvedPassword: ""
      });
      setBreachAnalysis({
        isPotentiallyBreached: false,
        confidence: 0,
        databases: [],
        attackMethods: [],
        checked: false
      });
      setAdvancedAnalysis(null);
      setStats(calculatePasswordStatistics(""));
      setPasswordStats({
        length: 0,
        uppercase: 0,
        lowercase: 0,
        numbers: 0,
        symbols: 0,
        other: 0
      });
      setHibpResult(null);
      setHashcatResult(null);
      setIsLoading(false);
      setIsAiLoading(false);
      setIsBreachLoading(false);
      setIsHibpLoading(false);
      setIsHashcatLoading(false);
      setError(null);
      setHibpError(null);
      setHashcatError(null);
      return;
    }
    
    // Calculate local password statistics immediately
    const calculatedStats = calculatePasswordStatistics(password);
    setStats(calculatedStats);
    
    // Update password character statistics
    setPasswordStats({
      length: password.length,
      uppercase: (password.match(/[A-Z]/g) || []).length,
      lowercase: (password.match(/[a-z]/g) || []).length,
      numbers: (password.match(/[0-9]/g) || []).length,
      symbols: (password.match(/[^A-Za-z0-9]/g) || []).length,
      other: password.length - 
             (password.match(/[A-Z]/g) || []).length - 
             (password.match(/[a-z]/g) || []).length - 
             (password.match(/[0-9]/g) || []).length - 
             (password.match(/[^A-Za-z0-9]/g) || []).length
    });
    
    // Run zxcvbn analysis immediately
    const zxcvbnResult = analyzePasswordAdvanced(password);
    setAdvancedAnalysis(zxcvbnResult);
    
    // Set up debounce timer for basic analysis
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await analyzePassword(password);
        // Add hardware estimates if not present
        if (!result.hardwareEstimates && zxcvbnResult) {
          result.hardwareEstimates = zxcvbnResult.hardwareEstimates;
        }
        setAnalysis(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to analyze password");
        console.error("Password analysis error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200); // 200ms debounce for regular analysis
    
    // Set up debounce timer for AI analysis
    const aiTimer = setTimeout(async () => {
      // Ensure we have the necessary data before calling the AI
      if (password.length >= 4 && zxcvbnResult && stats) {
        setIsAiLoading(true); // Set loading to true before the call
        try {
          // Calculate the CURRENT stats right before sending to ensure they're fresh
          const currentPasswordStats = {
            length: password.length,
            uppercase: (password.match(/[A-Z]/g) || []).length,
            lowercase: (password.match(/[a-z]/g) || []).length,
            numbers: (password.match(/[0-9]/g) || []).length,
            symbols: (password.match(/[^A-Za-z0-9]/g) || []).length
          };
          
          // // Log the stats right before creating the context for verification
          // console.log("Current password stats before AI call:", {
          //   password,
          //   passwordLength: password.length,
          //   currentStats: currentPasswordStats
          // });
    
          const analysisContext: PasswordAnalysisContext = {
            score: zxcvbnResult.score,
            entropy: calculatedStats.entropy,
            composition: {
              // Use the freshly calculated stats
              total: password.length, // Use direct password.length instead of passwordStats.length
              uppercase: currentPasswordStats.uppercase,
              lowercase: currentPasswordStats.lowercase,
              numbers: currentPasswordStats.numbers,
              symbols: currentPasswordStats.symbols,
            },
            crackTimeEstimates: {
              bruteForce: zxcvbnResult.timeEstimateBruteForce,
              smartGuessing: zxcvbnResult.timeEstimateSmartGuessing,
              hardware: zxcvbnResult.hardwareEstimates,
            },
          };
          
          const aiResult = await analyzePasswordWithOllama(password, analysisContext);
  // console.log("--- Hook received AI Result ---"); // <--- ADD THIS
  // console.log(aiResult);                        // <--- ADD THIS
  setAiAnalysis(aiResult); // <--- State update happens here
  // console.log("--- Hook finished setAiAnalysis ---"); // <--- ADD THIS
} catch (err) {
  console.error("Error during AI analysis call OR state update in hook:", err);
  // Optionally set an AI-specific error state here if needed
  // e.g., setAiError(err instanceof Error ? err.message : "Unknown AI error");
  // The analyzePasswordWithOllama function already returns a structured error
  // in aiResult on fetch failure, so direct state update might be sufficient.
  // If analyzePasswordWithOllama itself throws (e.g., network error before fetch),
  // you might want to set a fallback state here:
   setAiAnalysis({
     suggestions: ["Error: AI analysis failed.", err instanceof Error ? err.message : "Could not communicate"],
     reasoning: ["Could not get analysis from the backend service."],
     improvedPassword: password // Return original password on error
   });
} finally {
  setIsAiLoading(false); // <<< --- ENSURE THIS RUNS ALWAYS ---
}
} else {
 // If conditions aren't met, ensure loading is false
 setIsAiLoading(false);
}
}, 600);
    
    // Set up breach check with longer debounce
    const breachTimer = setTimeout(async () => {
      if (password.length >= 5) { // Only check for breaches if password is long enough
        setIsBreachLoading(true);
        
        try {
          const breachResult = await checkPasswordBreached(password);
          setBreachAnalysis({
            ...breachResult,
            checked: true
          });
        } catch (err) {
          console.error("Breach check error:", err);
          // Don't set error state to avoid UI disruption
        } finally {
          setIsBreachLoading(false);
        }
      }
    }, 800); // 800ms debounce for breach check
     // --- NEW HIBP CHECK DEBOUNCE ---
     const hibpTimer = setTimeout(async () => {
      // Only run if password has some length (adjust min length if needed)
      if (password.length >= 1) {
        setIsHibpLoading(true);
        setHibpError(null);
        try {
          const result = await checkPasswordHibp(password);
          setHibpResult(result);
        } catch (err) {
          console.error("HIBP check error in hook:", err);
          setHibpError(err instanceof Error ? err.message : "Failed HIBP check");
          setHibpResult(null); // Clear previous results on error
        } finally {
          setIsHibpLoading(false);
        }
      } else {
        // Clear results if password becomes too short after debounce starts
        setHibpResult(null);
        setHibpError(null);
      }
    }, 500); // 500ms debounce for HIBP check (adjust as needed)
    // --- Hashcat Cracking Simulation Timer ---
    const hashcatTimer = setTimeout(async () => {
      // Only run if password has some length (e.g., >= 1)
      // You might want a longer minimum length depending on typical use case
      if (password.length >= 1) {
          setIsHashcatLoading(true);
          setHashcatError(null);
          setHashcatResult(null); // Clear previous result before new request

          try {
              // 1. Calculate the hash (MD5 for this example)
              const hashToCrack = calculateMD5(password);

              // 2. Prepare the request payload
              //    Hardcoding mode 0 (MD5) and rockyou.txt for this example
              const crackRequest: HashcatCrackRequest = {
                  hash_value: hashToCrack,
                  hash_mode: 0, // MD5
                  wordlist_filename: "rockyou.txt" // Ensure this exists on your backend
              };

              // 3. Call the API
              const result = await crackHashWithHashcat(crackRequest);
              setHashcatResult(result);

          } catch (err) {
              console.error("Hashcat crack error in hook:", err);
              setHashcatError(err instanceof Error ? err.message : "Failed Hashcat crack request");
              setHashcatResult(null); // Clear result on error
          } finally {
              setIsHashcatLoading(false);
          }
      } else {
          // Clear results if password becomes too short
          setHashcatResult(null);
          setHashcatError(null);
          setIsHashcatLoading(false); // Ensure loading is off
      }
  }, 1000); // Longer debounce for Hashcat (e.g., 1000ms)
    // --- END NEW HIBP CHECK DEBOUNCE ---
    return () => {
      clearTimeout(timer);
      clearTimeout(aiTimer);
      clearTimeout(breachTimer);
      clearTimeout(hibpTimer);
      clearTimeout(hashcatTimer);
    };
  }, [password]);
  
  return {
    password,
    setPassword,
    analysis,
    aiAnalysis,
    breachAnalysis, // Keep this for the pattern check results
    hibpResult, 
    hashcatResult, 
    advancedAnalysis,
    stats,
    passwordStats,
    isLoading, // zxcvbn loading
    isAiLoading,
    isBreachLoading, // Pattern check loading
    isHibpLoading, // <-- Return HIBP loading state
    isHashcatLoading,
    error, // General error
    hibpError, // <-- Return HIBP specific error
    hashcatError,
    hasPassword: password.length > 0,
  };
}