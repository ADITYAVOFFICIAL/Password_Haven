
import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
  className
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className={cn(
      "relative w-full password-input-wrapper", 
      className
    )}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Lock size={18} className="animate-pulse-slow" />
      </div>
      
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-slate-200/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300"
        autoComplete="new-password"
        spellCheck={false}
      />
      
      <button 
        type="button"
        onClick={togglePasswordVisibility}
        className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:text-foreground"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff size={18} className="opacity-70 hover:opacity-100" />
        ) : (
          <Eye size={18} className="opacity-70 hover:opacity-100" />
        )}
      </button>
    </div>
  );
}
