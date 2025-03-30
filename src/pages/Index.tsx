
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PasswordInput } from "@/components/PasswordInput";
import { StrengthMeter } from "@/components/StrengthMeter";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { AIImprovement } from "@/components/AIImprovement";
import { BreachCheck } from "@/components/BreachCheck";
import { usePasswordAnalysis } from "@/hooks/usePasswordAnalysis";
import { Shield, Lock, CheckCircle2, Brain, File, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

const Index = () => {
  const {
    password,
    setPassword,
    analysis,
    aiAnalysis,
    breachAnalysis,
    advancedAnalysis,
    stats,
    passwordStats,
    isLoading,
    isAiLoading,
    isBreachLoading,
    hasPassword
  } = usePasswordAnalysis();
  
  const [mounted, setMounted] = useState(false);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(!import.meta.env.VITE_GEMINI_API_KEY);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <NavigationMenu className="justify-end py-4">
          <NavigationMenuList className="flex flex-wrap gap-1">
            <NavigationMenuItem>
              <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild>
                <Link to="/">Home</Link>
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild>
                <Link to="/faq">FAQ</Link>
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild>
                <Link to="/securitytips">Security Tips</Link>
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
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
          
          {hasPassword && password.length >= 5 && (
            <BreachCheck 
              password={password}
              breachData={breachAnalysis}
              isLoading={isBreachLoading}
              className="mt-6"
            />
          )}
          
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
