
import { useMemo } from "react";
import { Shield, ShieldAlert, ShieldCheck, Clock, AlertTriangle, Brain, Cpu, Laptop, Server } from "lucide-react";
import { STRENGTH_LEVELS } from "@/constants/config";
import { formatTimeToHack } from "@/utils/formatTTC";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface StrengthMeterProps {
  strength: number; // 0-4
  score: number; // 0-100
  timeToHack: string;
  timeToHackSmart?: string;
  hardwareEstimates?: {
    cpu: string;
    normalGpu: string;
    highEndGpu: string;
  };
  entropy?: number;
  isLoading?: boolean;
  className?: string;
  passwordStats?: {
    length: number;
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
    other: number;
  };
}

export function StrengthMeter({
  strength,
  score,
  timeToHack,
  timeToHackSmart,
  hardwareEstimates,
  entropy = 0,
  isLoading = false,
  className,
  passwordStats
}: StrengthMeterProps) {
  const strengthLevel = STRENGTH_LEVELS[strength as keyof typeof STRENGTH_LEVELS] || STRENGTH_LEVELS[0];
  
  const barWidth = useMemo(() => {
    return `${Math.max(5, score)}%`;
  }, [score]);
  
  const barColor = useMemo(() => {
    if (strength === 0) return "bg-strength-weak";
    if (strength === 1) return "bg-strength-weak";
    if (strength === 2) return "bg-strength-fair";
    if (strength === 3) return "bg-strength-good";
    return "bg-strength-strong";
  }, [strength]);
  
  const formattedTime = useMemo(() => {
    return formatTimeToHack(timeToHack);
  }, [timeToHack]);
  
  const formattedTimeSmart = useMemo(() => {
    return timeToHackSmart ? formatTimeToHack(timeToHackSmart) : null;
  }, [timeToHackSmart]);
  
  const getShieldIcon = () => {
    if (isLoading) return <Shield className="animate-pulse" />;
    
    if (strength <= 1) {
      return <ShieldAlert className="text-strength-weak animate-pulse" />;
    } else if (strength === 2) {
      return <Shield className="text-strength-fair" />;
    } else {
      return <ShieldCheck className="text-strength-good" />;
    }
  };
  
  const totalChars = passwordStats ? 
    passwordStats.length : 0;
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength label with shield icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getShieldIcon()}
          <span className="font-medium tracking-tight">{strengthLevel.label}</span>
          
          {entropy > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="inline-flex items-center justify-center rounded-full bg-primary/10 p-1 text-primary hover:bg-primary/20">
                  <span className="text-xs font-medium">{entropy.toFixed(1)}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Password entropy: {entropy.toFixed(1)} bits</p>
                  <p className="text-xs text-muted-foreground">Higher entropy = stronger password</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Strength meter bar */}
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn(
            "strength-bar",
            barColor,
            isLoading && "animate-pulse"
          )}
          style={{ width: barWidth }}
        />
      </div>
      
      {/* Password stats if available */}
      {passwordStats && totalChars > 0 && (
        <div className="mt-3 space-y-2 bg-slate-50/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Character Composition</span>
            <span>{totalChars} characters total</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {passwordStats.uppercase > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Uppercase</span>
                  <span className="text-slate-500">{passwordStats.uppercase} 
                    <span className="text-slate-400 text-[10px]">
                      ({Math.round(passwordStats.uppercase / totalChars * 100)}%)
                    </span>
                  </span>
                </div>
                <Progress value={(passwordStats.uppercase / totalChars) * 100} 
                  className="h-1.5 bg-slate-200" 
                  indicatorClassName="bg-blue-500" />
              </div>
            )}
            
            {passwordStats.lowercase > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Lowercase</span>
                  <span className="text-slate-500">{passwordStats.lowercase} 
                    <span className="text-slate-400 text-[10px]">
                      ({Math.round(passwordStats.lowercase / totalChars * 100)}%)
                    </span>
                  </span>
                </div>
                <Progress value={(passwordStats.lowercase / totalChars) * 100} 
                  className="h-1.5 bg-slate-200" 
                  indicatorClassName="bg-green-500" />
              </div>
            )}
            
            {passwordStats.numbers > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Numbers</span>
                  <span className="text-slate-500">{passwordStats.numbers} 
                    <span className="text-slate-400 text-[10px]">
                      ({Math.round(passwordStats.numbers / totalChars * 100)}%)
                    </span>
                  </span>
                </div>
                <Progress value={(passwordStats.numbers / totalChars) * 100} 
                  className="h-1.5 bg-slate-200" 
                  indicatorClassName="bg-amber-500" />
              </div>
            )}
            
            {passwordStats.symbols > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Symbols</span>
                  <span className="text-slate-500">{passwordStats.symbols} 
                    <span className="text-slate-400 text-[10px]">
                      ({Math.round(passwordStats.symbols / totalChars * 100)}%)
                    </span>
                  </span>
                </div>
                <Progress value={(passwordStats.symbols / totalChars) * 100} 
                  className="h-1.5 bg-slate-200" 
                  indicatorClassName="bg-purple-500" />
              </div>
            )}
            
            {passwordStats.other > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Other</span>
                  <span className="text-slate-500">{passwordStats.other} 
                    <span className="text-slate-400 text-[10px]">
                      ({Math.round(passwordStats.other / totalChars * 100)}%)
                    </span>
                  </span>
                </div>
                <Progress value={(passwordStats.other / totalChars) * 100} 
                  className="h-1.5 bg-slate-200" 
                  indicatorClassName="bg-gray-500" />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Time to crack section */}
      <div className="flex flex-col space-y-2 mt-2">
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} className="text-primary shrink-0" />
          <span className="text-muted-foreground">Brute Force:</span>
          <span className="font-mono ml-auto">
            {isLoading ? "Calculating..." : formattedTime || "N/A"}
          </span>
        </div>
        
        {formattedTimeSmart && (
          <div className="flex items-center gap-2 text-sm">
            <Brain size={14} className="text-primary shrink-0" />
            <span className="text-muted-foreground">Smart Guessing:</span>
            <span className="font-mono ml-auto">
              {isLoading ? "Calculating..." : formattedTimeSmart}
            </span>
          </div>
        )}
        
        {hardwareEstimates && !isLoading && (
          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-medium text-slate-500">Hardware-specific estimates (bcrypt):</h4>
            
            <div className="flex items-center gap-2 text-xs">
              <Cpu size={12} className="text-primary shrink-0" />
              <span className="text-muted-foreground">Standard CPU:</span>
              <span className="font-mono ml-auto text-xs">
                {hardwareEstimates.cpu}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Laptop size={12} className="text-primary shrink-0" />
              <span className="text-muted-foreground">Normal GPU:</span>
              <span className="font-mono ml-auto text-xs">
                {hardwareEstimates.normalGpu}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Server size={12} className="text-primary shrink-0" />
              <span className="text-muted-foreground">High-End GPU:</span>
              <span className="font-mono ml-auto text-xs">
                {hardwareEstimates.highEndGpu}
              </span>
            </div>
          </div>
        )}
        
        {formattedTimeSmart && strength <= 2 && (
          <div className="flex items-start gap-2 text-xs mt-1 text-amber-600">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>59% of real passwords are cracked within an hour using smart algorithms</span>
          </div>
        )}
      </div>
    </div>
  );
}
