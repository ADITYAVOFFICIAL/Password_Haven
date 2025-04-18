// src/hooks/useIsMobile.ts
import * as React from "react";

// Standard Tailwind 'md' breakpoint is 768px
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize state based on current window width or undefined if SSR
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    typeof window !== "undefined"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : undefined
  );

  React.useEffect(() => {
    // Ensure this effect only runs client-side
    if (typeof window === "undefined") {
      return;
    }

    const checkSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkSize();

    // Add listener
    window.addEventListener("resize", checkSize);

    // Cleanup listener
    return () => window.removeEventListener("resize", checkSize);
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Return !!isMobile to ensure it's always a boolean (true/false)
  // once determined, handling the initial undefined state.
  // Consumers might need to handle the initial undefined state if immediate rendering depends on it.
  return isMobile;
}