// src/components/PasswordInput.tsx (or similar path)
import { useState } from "react";
import { Eye, EyeOff, Lock, Clipboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void; // This function updates the state in the hook
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

  // REMOVED: handlePaste function is no longer needed

  const handlePasteButton = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      // Still trim here for the button-based paste
      onChange(clipboardText.trim());
    } catch (error) {
      console.error("Failed to read clipboard contents:", error);
      // Optionally notify the user
    }
  };

  return (
    <div className={cn("relative w-full password-input-wrapper", className)}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Lock size={18} className="animate-pulse-slow" />
      </div>

      <input
        type={showPassword ? "text" : "password"}
        value={value}
        // This onChange now handles typing AND pasting into the input field
        onChange={(e) => onChange(e.target.value)}
        // REMOVED: onPaste prop is gone
        placeholder={placeholder}
        className="w-full pl-10 pr-24 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-slate-200/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300"
        autoComplete="new-password" // use "new-password" to hint password managers
        spellCheck={false}
      />

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        <button
          type="button"
          onClick={handlePasteButton} // Keep the button paste functionality
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none"
          aria-label="Paste password from clipboard"
        >
          <Clipboard size={18} className="opacity-70 hover:opacity-100" />
        </button>
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff size={18} className="opacity-70 hover:opacity-100" />
          ) : (
            <Eye size={18} className="opacity-70 hover:opacity-100" />
          )}
        </button>
      </div>
    </div>
  );
}