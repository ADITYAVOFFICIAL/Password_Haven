
import { useState, useEffect } from "react";
import { AlertTriangle, BadgeCheck, Shield, ExternalLink, Database } from "lucide-react";
import { checkPasswordBreached } from "@/api/passwordService";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface BreachCheckProps {
  password: string;
  breachData?: {
    isPotentiallyBreached: boolean;
    confidence: number;
    databases: string[];
    attackMethods: string[];
    checked: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function BreachCheck({
  password,
  breachData,
  isLoading: externalLoading,
  className
}: BreachCheckProps) {
  const [result, setResult] = useState<{
    isPotentiallyBreached: boolean;
    confidence: number;
    databases: string[];
    attackMethods: string[];
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  // Use external breach data if provided
  useEffect(() => {
    if (breachData && breachData.checked) {
      setResult({
        isPotentiallyBreached: breachData.isPotentiallyBreached,
        confidence: breachData.confidence,
        databases: breachData.databases,
        attackMethods: breachData.attackMethods
      });
      setIsChecked(true);
      setIsLoading(false);
    }
  }, [breachData]);
  
  // Fallback to local check if not provided externally
  useEffect(() => {
    if (!breachData && password && !isChecked) {
      const checkBreach = async () => {
        setIsLoading(true);
        try {
          const checkResult = await checkPasswordBreached(password);
          setResult(checkResult);
          setIsChecked(true);
        } catch (error) {
          console.error("Error checking for breaches:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkBreach();
    }
  }, [password, breachData, isChecked]);
  
  // Reset when password changes
  useEffect(() => {
    setIsChecked(false);
    setResult(null);
  }, [password]);
  
  const isCurrentlyLoading = externalLoading !== undefined ? externalLoading : isLoading;
  
  if (!password || !result) {
    return null;
  }
  
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      result?.isPotentiallyBreached 
        ? "bg-amber-50/50 border-amber-200"
        : "bg-emerald-50/50 border-emerald-200",
      className
    )}>
      {isCurrentlyLoading ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-5 w-[200px]" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            {result?.isPotentiallyBreached ? (
              <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            ) : (
              <BadgeCheck size={18} className="text-emerald-500 shrink-0" />
            )}
            <h3 className="font-medium">
              {result?.isPotentiallyBreached 
                ? "Password potentially compromised" 
                : "Password not found in known breaches"}
            </h3>
          </div>
          
          {result?.isPotentiallyBreached ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                This password pattern appears similar to known compromised passwords 
                {result.confidence > 0 && <span> (confidence: {result.confidence}%)</span>}.
              </p>
              
              {result.databases.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <Database size={14} />
                    <span>Similar passwords found in these breach databases:</span>
                  </p>
                  <ul className="text-sm pl-7 list-disc space-y-1 text-slate-700">
                    {result.databases.map((db, index) => (
                      <li key={index}>{db}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.attackMethods.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <Shield size={14} />
                    <span>Vulnerable to these attack methods:</span>
                  </p>
                  <ul className="text-sm pl-7 list-disc space-y-1 text-slate-700">
                    {result.attackMethods.map((method, index) => (
                      <li key={index}>{method}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200 flex items-center gap-1">
                <ExternalLink size={12} />
                <span>
                  Our password security system uses patterns from known breaches to evaluate your password.
                </span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-700">
                Your password doesn't match common patterns found in known data breaches.
              </p>
              <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200 flex items-center gap-1">
                <Shield size={12} />
                <span>
                  For maximum security, never reuse passwords across different sites.
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
