
import { Info, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface FeedbackPanelProps {
  feedback: string[];
  strength: number;
  hasPassword: boolean;
  className?: string;
}

export function FeedbackPanel({
  feedback,
  strength,
  hasPassword,
  className
}: FeedbackPanelProps) {
  const [mounted, setMounted] = useState(false);
  
  // Reset animation when feedback changes
  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, [feedback]);
  
  return (
    <div className={cn(
      "bg-white/30 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 shadow-sm",
      "transition-all duration-500 ease-out",
      className
    )}>
      <h3 className="text-lg font-medium mb-3">
        {hasPassword ? "Feedback & Suggestions" : "Password Analysis"}
      </h3>
      
      <ul className={cn(
        "space-y-2.5",
        mounted && "opacity-100",
        !mounted && "opacity-0"
      )}>
        {feedback.map((item, index) => (
          <li 
            key={index} 
            className={cn(
              "flex items-start gap-3 p-2 rounded-lg transition-all duration-300 feedback-item",
              strength >= 3 ? "text-slate-700" : "text-slate-600"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {strength >= 3 && hasPassword ? (
              <CheckCircle2 size={18} className="text-strength-good mt-0.5 shrink-0" />
            ) : hasPassword ? (
              <ArrowRight size={18} className="text-primary mt-0.5 shrink-0" />
            ) : (
              <Info size={18} className="text-primary mt-0.5 shrink-0" />
            )}
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
