
import { useState } from "react";
import { checkPasswordBreached } from "@/api/passwordService";

export function useBreachValidator() {
  const [isChecking, setIsChecking] = useState(false);
  const [isBreached, setIsBreached] = useState(false);
  const [breachConfidence, setBreachConfidence] = useState(0);
  const [breachDatabases, setBreachDatabases] = useState<string[]>([]);
  const [breachCheckCompleted, setBreachCheckCompleted] = useState(false);
  
  /**
   * Validates a password against known breach databases
   * Returns true if password is valid (not found in breaches)
   */
  const validatePassword = async (password: string): Promise<boolean> => {
    if (!password || password.length < 8) {
      setIsBreached(false);
      setBreachConfidence(0);
      setBreachDatabases([]);
      setBreachCheckCompleted(true);
      return false;
    }
    
    setIsChecking(true);
    setBreachCheckCompleted(false);
    
    try {
      const result = await checkPasswordBreached(password);
      
      setIsBreached(result.isPotentiallyBreached);
      setBreachConfidence(result.confidence);
      setBreachDatabases(result.databases);
      setBreachCheckCompleted(true);
      
      return !result.isPotentiallyBreached;
    } catch (error) {
      console.error("Error checking breach status:", error);
      setBreachCheckCompleted(true);
      return false;
    } finally {
      setIsChecking(false);
    }
  };
  
  /**
   * Validates a list of passwords and returns the first non-breached password
   * If all are breached, returns null
   */
  const validateMultiplePasswords = async (
    passwords: string[],
    onFoundNonBreached?: (password: string, index: number) => void
  ): Promise<string | null> => {
    for (let i = 0; i < passwords.length; i++) {
      const password = passwords[i];
      if (!password || password.length < 8) continue;
      
      const isValid = await validatePassword(password);
      
      if (isValid) {
        if (onFoundNonBreached) {
          onFoundNonBreached(password, i);
        }
        return password;
      }
    }
    
    return null;
  };
  
  return {
    validatePassword,
    validateMultiplePasswords,
    isChecking,
    isBreached,
    breachConfidence,
    breachDatabases,
    breachCheckCompleted
  };
}
