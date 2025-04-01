import { AlertTriangle, BadgeCheck, Clock, Hash, Key, List, Server, ShieldOff, ShieldCheck } from "lucide-react"; // Added ShieldOff, ShieldCheck
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { HashcatCrackResponse } from "@/api/passwordService"; // Import the type

interface HashcatCrackCardProps {
  crackResult: HashcatCrackResponse | null;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export function HashcatCrackCard({
  crackResult,
  isLoading,
  error,
  className
}: HashcatCrackCardProps) {

  // Don't render anything if not loading, no result, and no error
  if (!crackResult && !isLoading && !error) {
    return null;
  }

  const status = crackResult?.status;
  const isSuccess = status === 'success'; // Password was found (BAD)
  const isFailed = status === 'failed';   // Password was not found (GOOD)
  const isError = status === 'error' || !!error; // Process error (NEUTRAL/WARNING)

  // Determine background, border, and text colors based on the *security implication*
  const cardClasses = cn(
    "mt-5 p-4 rounded-lg border transition-colors duration-300",
    isLoading ? "bg-slate-50/50 border-slate-200 animate-pulse" : // Loading: Neutral
    isError   ? "bg-amber-50/50 border-amber-200" :                // Error: Yellow/Amber
    isSuccess ? "bg-red-50/50 border-red-200" :                    // Success (Found): Red (Bad)
    isFailed  ? "bg-emerald-50/50 border-emerald-200" :            // Failed (Not Found): Green (Good)
               "bg-slate-50/50 border-slate-200",                  // Default/fallback
    className
  );

  // Determine icon and text color based on security implication
  const iconColor = isError ? "text-amber-500" : isSuccess ? "text-red-500" : isFailed ? "text-emerald-500" : "text-slate-500";
  const titleColor = isError ? "text-amber-700" : isSuccess ? "text-red-700" : isFailed ? "text-emerald-700" : "text-slate-700";
  const messageColor = isError ? "text-amber-600" : isSuccess ? "text-red-600" : isFailed ? "text-emerald-600" : "text-slate-600";

  const IconComponent = isError ? AlertTriangle : isSuccess ? ShieldOff : isFailed ? ShieldCheck : AlertTriangle; // Default to AlertTriangle if state is unclear

  return (
    <div className={cardClasses}>
      {isLoading ? (
        // Loading Skeleton
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-[250px]" /> {/* Slightly wider */}
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : isError ? (
         // Error State (Amber/Yellow)
        <div className="flex items-start gap-3">
           <IconComponent size={18} className={cn(iconColor, "shrink-0 mt-0.5")} />
           <div>
             <h3 className={cn("font-medium", titleColor)}>Hashcat Cracking Error</h3>
             <p className={cn("text-sm", messageColor)}>{crackResult?.message || error || "An unknown error occurred during the cracking attempt."}</p>
             {crackResult?.hash_value && (
                <p className="text-xs text-amber-500 mt-1 truncate">Hash attempted: {crackResult.hash_value}</p>
             )}
           </div>
         </div>
      ) : crackResult ? (
        // Result State (Success=Red, Failed=Green)
        <div>
          {/* Header with Icon and Title */}
          <div className="flex items-center gap-2 mb-2">
            <IconComponent size={18} className={cn(iconColor, "shrink-0")} />
            <h3 className={cn("font-medium", titleColor)}>
              {isSuccess ? "Hashcat: Password Cracked (Insecure)" : "Hashcat: Password Not Found (Safer)"}
            </h3>
          </div>

          {/* Details Section */}
          <div className="space-y-1.5 text-sm pl-7">
            {/* Main Message */}
            <p className={messageColor}>{crackResult.message}</p>

            {/* Cracked Password (Only if Success) */}
            {isSuccess && crackResult.cracked_password && (
              <div className="flex items-center gap-1.5 font-medium text-red-700"> {/* Red text */}
                <Key size={14} />
                <span>Password Found:</span>
                <code className="bg-red-100 px-1.5 py-0.5 rounded text-red-800 text-xs"> {/* Red background */}
                  {crackResult.cracked_password}
                </code>
              </div>
            )}

            {/* Common Details (Hash, Wordlist, Mode, Time) */}
            <div className="flex items-center gap-1.5 pt-1 text-slate-700">
              <Hash size={14} className="text-slate-500"/>
              <span>Original Hash (MD5):</span>
              <code className="text-xs text-slate-500 truncate" title={crackResult.hash_value}>
                {crackResult.hash_value}
              </code>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              <List size={14} className="text-slate-500"/>
              <span>Wordlist Used:</span>
              <span className="text-slate-600">{crackResult.wordlist_used}</span>
            </div>

             <div className="flex items-center gap-1.5 text-slate-700">
               <Server size={14} className="text-slate-500"/>
               <span>Hash Mode:</span>
               <span className="text-slate-600">{crackResult.hash_mode} (MD5)</span>
             </div>

            {crackResult.elapsed_time_seconds !== null && crackResult.elapsed_time_seconds !== undefined && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Clock size={14} className="text-slate-500"/>
                <span>Time Elapsed:</span>
                <span className="text-slate-600">{crackResult.elapsed_time_seconds.toFixed(2)} seconds</span>
              </div>
            )}
          </div>
        </div>
      ) : null /* Should not happen if !isLoading && !error */}
    </div>
  );
}