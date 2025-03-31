// src/components/HibpCheckCard.tsx
import { AlertTriangle, BadgeCheck, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { HibpCheckResponse } from "@/api/passwordService"; // Import the type

interface HibpCheckCardProps {
  hibpResult: HibpCheckResponse | null;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export function HibpCheckCard({
  hibpResult,
  isLoading,
  error,
  className
}: HibpCheckCardProps) {

  // Don't render anything if loading initial data or no result yet and not loading
  if (!hibpResult && !isLoading && !error) {
    return null;
  }

  const isPwned = hibpResult?.pwned ?? false;

  return (
    <div className={cn(
      "mt-5 p-4 rounded-lg border transition-colors duration-300",
      isLoading ? "bg-slate-50/50 border-slate-200 animate-pulse" :
      error ? "bg-red-50/50 border-red-200" :
      isPwned ? "bg-red-50/50 border-red-200" : // Use red for definite breach
               "bg-emerald-50/50 border-emerald-200",
      className
    )}>
      {isLoading ? (
        // Loading Skeleton
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-[250px]" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      ) : error ? (
         // Error State
        <div className="flex items-center gap-2">
           <AlertTriangle size={18} className="text-red-500 shrink-0" />
           <div>
             <h3 className="font-medium text-red-700">HIBP Check Error</h3>
             <p className="text-sm text-red-600">{error}</p>
           </div>
         </div>
      ) : hibpResult ? (
        // Result State
        <>
          <div className="flex items-center gap-2 mb-1">
            {isPwned ? (
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
            ) : (
              <BadgeCheck size={18} className="text-emerald-500 shrink-0" />
            )}
            <h3 className="font-medium">
              {isPwned
                ? "Password Found in HIBP Database"
                : "Password Not Found in HIBP Database"}
            </h3>
          </div>
          <p className="text-sm text-slate-700 ml-7">
            {isPwned
              ? "This exact password was found in the Have I Been Pwned database, indicating it has been exposed in a data breach. You should not use it."
              : "This password was not found in the Have I Been Pwned database of known breached passwords."}
          </p>
           {/* Optional: Display check method info */}
           {/* <p className="text-xs text-slate-500 mt-2 ml-7">
             (Check method: {hibpResult.check_method})
           </p> */}
        </>
      ) : null /* Should not happen if !isLoading && !error */}
    </div>
  );
}