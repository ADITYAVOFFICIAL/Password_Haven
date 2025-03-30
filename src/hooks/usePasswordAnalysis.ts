
import { useState, useEffect } from "react";
import { analyzePassword, type PasswordAnalysisResponse, checkPasswordBreached } from "@/api/passwordService";
// import { analyzePasswordWithGemini } from "@/api/geminiService";
import { analyzePasswordWithOllama, type PasswordAnalysisContext } from "@/api/ollamaService";
import { DEFAULT_FEEDBACK } from "@/constants/config";
import { calculatePasswordStatistics } from "@/utils/formatTTC";
import { analyzePasswordAdvanced } from "@/utils/passwordAnalysis";

export function usePasswordAnalysis() {
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
      setIsLoading(false);
      setIsAiLoading(false);
      setIsBreachLoading(false);
      setError(null);
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
        setIsAiLoading(true);
        
        try {
          // Calculate the CURRENT stats right before sending to ensure they're fresh
          const currentPasswordStats = {
            length: password.length,
            uppercase: (password.match(/[A-Z]/g) || []).length,
            lowercase: (password.match(/[a-z]/g) || []).length,
            numbers: (password.match(/[0-9]/g) || []).length,
            symbols: (password.match(/[^A-Za-z0-9]/g) || []).length
          };
          
          // Log the stats right before creating the context for verification
          console.log("Current password stats before AI call:", {
            password,
            passwordLength: password.length,
            currentStats: currentPasswordStats
          });
    
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
          setAiAnalysis(aiResult);
        } catch (err) {
          // Rest of error handling code...
        }
      }
    }, 600); // 600ms debounce for AI analysis
    
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
    
    return () => {
      clearTimeout(timer);
      clearTimeout(aiTimer);
      clearTimeout(breachTimer);
    };
  }, [password]);
  
  return {
    password,
    setPassword,
    analysis,
    aiAnalysis,
    breachAnalysis,
    advancedAnalysis,
    stats,
    passwordStats,
    isLoading,
    isAiLoading,
    isBreachLoading,
    error,
    hasPassword: password.length > 0
  };
}
