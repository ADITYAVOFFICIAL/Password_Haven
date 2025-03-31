
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PasswordInput } from "@/components/PasswordInput";
import { StrengthMeter } from "@/components/StrengthMeter";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { AIImprovement } from "@/components/AIImprovement";
import { BreachCheck } from "@/components/BreachCheck";
import { HibpCheckCard } from "@/components/HibpCheckCard";
import { usePasswordAnalysis } from "@/hooks/usePasswordAnalysis";
import { Shield, Lock, Brain, Database } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
interface BreachCheckProps {
  password: string;
  breachData?: {
    isPotentiallyBreached: boolean;
    confidence: number;
    databases: string[];
    attackMethods: string[];
    checked: boolean; // Indicates if data is ready
  };
  isLoading?: boolean; // Allow external loading state
  className?: string;
}
const Index = () => {
  const {
    password,
    setPassword,
    analysis,
    aiAnalysis,
    breachAnalysis,
    hibpResult,
    advancedAnalysis,
    stats,
    passwordStats,
    isLoading,
    isAiLoading,
    isBreachLoading,
    isHibpLoading,
    hibpError, 
    hasPassword
  } = usePasswordAnalysis();
  
  const [mounted, setMounted] = useState(false);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(!import.meta.env.VITE_GEMINI_API_KEY);
  const isMobile = useIsMobile();
  // Determine if we should show the BreachCheck component based on HIBP result or pattern check
  const shouldShowBreachInfo = hasPassword && (hibpResult?.pwned || password.length >= 5);

  // Prepare the data to pass to BreachCheck
  let breachCheckDataToShow: BreachCheckProps['breachData'] | undefined;
  let breachCheckLoadingState = false;

  if (hasPassword) {
    // Prioritize HIBP result
    if (hibpResult && !isHibpLoading && !hibpError) { // Check if HIBP result is available and not loading/error
      if (hibpResult.pwned) {
        // Case 1: HIBP found the password. Force the "compromised" view in BreachCheck.
        breachCheckDataToShow = {
          isPotentiallyBreached: true,
          confidence: 100, // High confidence due to exact match
          databases: ["Have I Been Pwned"], // Source
          attackMethods: ["Known Breach Exposure"], // Reason
          checked: true, // Data is ready
        };
        breachCheckLoadingState = false; // Not loading, we have the HIBP result
      } else if (password.length >= 4) {
         // Case 2: HIBP did NOT find it, but password is long enough.
         // Use the result from the pattern-based check (`breachAnalysis`).
         breachCheckDataToShow = breachAnalysis;
         breachCheckLoadingState = isBreachLoading; // Use the loading state for the pattern check
      }
    } else if (password.length >= 4) {
        // Case 3: HIBP check is still pending, errored, or password too short for HIBP,
        // but long enough for pattern check. Use pattern check result.
        breachCheckDataToShow = breachAnalysis;
        breachCheckLoadingState = isBreachLoading;
    }
  } // Add this closing curly brace

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Layout>
      <section className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className={`text-center max-w-2xl mx-auto mb-8 md:mb-12 transition-all duration-1000 ${mounted ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-10'}`}>
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight">
            Intelligent Password Strength Analyzer
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Check how secure your password is with our advanced AI analysis tool.
            Get real-time feedback to create stronger, safer passwords.
          </p>
        </div>
        
        {/* {showApiKeyAlert && (
          <Alert className="mb-6 bg-amber-50 border-amber-200 max-w-2xl mx-auto">
            <AlertDescription className="flex items-start gap-2">
              <Brain className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">Gemini API key not detected. </span>
                <span>Set the VITE_GEMINI_API_KEY environment variable to enable advanced AI analysis. Currently using fallback mode.</span>
              </div>
            </AlertDescription>
          </Alert>
        )} */}
        
        <div className={`glass rounded-2xl p-5 md:p-8 max-w-2xl mx-auto shadow-lg transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
              Enter a password to analyze
            </label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Type your password here..."
            />
          </div>
          
          <StrengthMeter
            strength={analysis.strength}
            score={analysis.score}
            timeToHack={analysis.timeToHack}
            timeToHackSmart={analysis.timeToHackSmart}
            hardwareEstimates={analysis.hardwareEstimates}
            entropy={analysis.entropy}
            passwordStats={passwordStats}
            isLoading={isLoading}
            className="mb-8"
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <FeedbackPanel
              feedback={analysis.feedback}
              strength={analysis.strength}
              hasPassword={hasPassword}
            />
            
            {hasPassword && (
              <AIImprovement
                password={password}
                suggestions={aiAnalysis.suggestions}
                reasoning={aiAnalysis.reasoning}
                improvedPassword={aiAnalysis.improvedPassword}
                isLoading={isAiLoading}
              />
            )}
          </div>
          {/* ----- HIBP and Breach Check Section ----- */}
          {hasPassword && ( // Only show these cards if there's a password
            <>
              {/* HIBP Check Card - Always shown when password exists */}
              <HibpCheckCard
                hibpResult={hibpResult}
                isLoading={isHibpLoading}
                error={hibpError}
                className="mb-6" // Add margin between cards
              />

              {/* Breach Check Card - Conditionally rendered based on HIBP or pattern check */}
              {/* Renders if HIBP found it OR if password >= 5 chars and HIBP check is done or pending */}
              {shouldShowBreachInfo && breachCheckDataToShow && breachCheckDataToShow.checked && ( // Ensure data is checked before rendering
                 <BreachCheck
                   password={password} // Pass password for context if needed by component
                   breachData={breachCheckDataToShow} // Pass the prepared data
                   isLoading={breachCheckLoadingState} // Pass the correct loading state
                   // className="mt-6" // Removed redundant margin, handled by HibpCheckCard's mb-6
                 />
               )}
            </>
          )}
          {/* ----- End HIBP and Breach Check Section ----- */}
          
          <div className="mt-8 text-center text-sm text-muted-foreground bg-slate-50/50 p-3 rounded-lg">
            <span className="flex items-center justify-center gap-1.5">
              <Shield size={14} />
              <span>Your password is never stored or sent to any third-party services</span>
            </span>
          </div>
        </div>
        
        <div className={`mt-12 md:mt-16 grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-primary" />}
            title="Real-time Analysis"
            description="Get instant feedback as you type your password with no delay"
          />
          <FeatureCard
            icon={<Brain className="h-6 w-6 text-primary" />}
            title="AI-Powered Suggestions"
            description="Advanced AI analysis to identify vulnerabilities and suggest improvements"
          />
          <FeatureCard
            icon={<Lock className="h-6 w-6 text-primary" />}
            title="Privacy First"
            description="Your password never leaves your device - all processing is done securely"
          />
        </div>
        
        <div className="text-center mt-12 mb-4">
          <Button className="mr-2 my-1" variant="outline" asChild>
            <Link to="/securitytips">Security Tips</Link>
          </Button>
          <Button variant="outline" className="my-1" asChild>
            <Link to="/faq">Frequently Asked Questions</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 p-2 rounded-full bg-primary/10">{icon}</div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Index;
