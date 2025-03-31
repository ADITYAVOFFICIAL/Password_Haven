
import { useState, useEffect, useCallback } from "react";
import { BadgeCheck, Copy, RefreshCw, CopyCheck, Brain, AlertTriangle, Settings, Check, Shield, Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { useBreachValidator } from "@/hooks/useBreachValidator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { analyzePasswordAdvanced } from "@/utils/passwordAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface AIImprovementProps {
  password: string;
  suggestions: string[];
  reasoning: string[];
  improvedPassword: string;
  isLoading: boolean;
  className?: string;
}

export function AIImprovement({
  password,
  suggestions,
  reasoning,
  improvedPassword,
  isLoading,
  className
}: AIImprovementProps) {
  const [copied, setCopied] = useState(false);
  const [suggestedPasswords, setSuggestedPasswords] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCustomization, setShowCustomization] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerationAttempts, setRegenerationAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [advancedAnalysis, setAdvancedAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("suggestion");

  const [passwordSettings, setPasswordSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });
  const { 
    validatePassword, 
    validateMultiplePasswords,
    isChecking, 
    isBreached,
    breachConfidence,
    breachDatabases,
    breachCheckCompleted
  } = useBreachValidator();
  
  // Generate alternative suggestions when the AI suggestion changes
  useEffect(() => {
    if (improvedPassword) {
      const alternatives = [improvedPassword];
      
      // Generate 2 more alternatives with variations
      for (let i = 0; i < 2; i++) {
        alternatives.push(generateAlternativePassword(improvedPassword, passwordSettings));
      }
      
      setSuggestedPasswords(alternatives);
      
      // Validate all passwords against breach databases
      validateAndSetBestPassword(alternatives);
    }
  }, [improvedPassword]);
  
  // Validate all suggested passwords and use the first non-breached one
  const validateAndSetBestPassword = async (passwords: string[]) => {
    setRegenerating(true);
    
    try {
      const bestPassword = await validateMultiplePasswords(
        passwords,
        (validPassword) => {
          setCurrentPassword(validPassword);
        }
      );
      
      if (bestPassword) {
        setCurrentPassword(bestPassword);
      } else {
        // If all were breached, generate a completely new one
        const newPassword = generateCompletelyNewPassword(passwordSettings);
        const isValid = await validatePassword(newPassword);
        
        if (isValid) {
          setCurrentPassword(newPassword);
        } else {
          // Last resort - use the original improved password even if breached
          setCurrentPassword(improvedPassword);
        }
      }
    } catch (error) {
      console.error("Error validating passwords:", error);
      setCurrentPassword(improvedPassword);
    } finally {
      setRegenerating(false);
    }
  };
  
  // Analyze password with zxcvbn when currentPassword changes
  useEffect(() => {
    if (!currentPassword) return;
    
    // Advanced password analysis
    const analysis = analyzePasswordAdvanced(currentPassword, [password]);
    setAdvancedAnalysis(analysis);
    
    // Initial breach check
    validatePassword(currentPassword);
  }, [currentPassword, password]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const regeneratePassword = () => {
    const newPassword = generateCompletelyNewPassword(passwordSettings);
    setCurrentPassword(newPassword);
    validatePassword(newPassword);
  };
  
  const generateAlternativePassword = (basePassword: string, settings: typeof passwordSettings): string => {
    const charset = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,./<>?'
    };
    
    // Take 70% of the base password and modify it
    const keepLength = Math.floor(basePassword.length * 0.7);
    let newPassword = basePassword.substring(0, keepLength);
    
    // Add some variation for the rest
    const remainingLength = settings.length - newPassword.length;
    let availableChars = '';
    
    if (settings.includeLowercase) availableChars += charset.lowercase;
    if (settings.includeUppercase) availableChars += charset.uppercase;
    if (settings.includeNumbers) availableChars += charset.numbers;
    if (settings.includeSymbols) availableChars += charset.symbols;
    
    // Add random characters to complete the password
    for (let i = 0; i < remainingLength; i++) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      newPassword += availableChars.charAt(randomIndex);
    }
    
    return shuffleString(newPassword);
  };
  
  const generateCompletelyNewPassword = (settings: typeof passwordSettings): string => {
    const charset = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,./<>?'
    };
    
    let availableChars = '';
    if (settings.includeLowercase) availableChars += charset.lowercase;
    if (settings.includeUppercase) availableChars += charset.uppercase;
    if (settings.includeNumbers) availableChars += charset.numbers;
    if (settings.includeSymbols) availableChars += charset.symbols;
    
    // Fallback to ensure we have some characters
    if (!availableChars) availableChars = charset.lowercase + charset.numbers;
    
    // Generate a new password with improved entropy
    let newPassword = '';
    
    // Ensure we include at least one character from each selected type
    if (settings.includeLowercase) {
      newPassword += charset.lowercase.charAt(Math.floor(Math.random() * charset.lowercase.length));
    }
    if (settings.includeUppercase) {
      newPassword += charset.uppercase.charAt(Math.floor(Math.random() * charset.uppercase.length));
    }
    if (settings.includeNumbers) {
      newPassword += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
    }
    if (settings.includeSymbols) {
      newPassword += charset.symbols.charAt(Math.floor(Math.random() * charset.symbols.length));
    }
    
    // Fill the rest of the password
    const remainingLength = settings.length - newPassword.length;
    for (let i = 0; i < remainingLength; i++) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      newPassword += availableChars[randomIndex];
    }
    
    // Shuffle the password to make the character order random
    return shuffleString(newPassword);
  };
  
  // Fisher-Yates shuffle for strings
  const shuffleString = (str: string): string => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };
  
  if (!password) {
    return null;
  }
  
  const getStrengthColor = (score: number) => {
    if (score < 2) return "text-strength-weak";
    if (score < 3) return "text-strength-fair";
    return "text-strength-good";
  };

  const renderPatternsFound = () => {
    if (!advancedAnalysis || !advancedAnalysis.patterns || advancedAnalysis.patterns.length === 0) {
      return null;
    }

    // Group patterns by severity
    const criticalPatterns = advancedAnalysis.patterns.filter((p: any) => p.severity === 'critical');
    const warningPatterns = advancedAnalysis.patterns.filter((p: any) => p.severity === 'warning');
    
    if (criticalPatterns.length === 0 && warningPatterns.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        <h4 className="text-sm font-medium">Patterns detected:</h4>
        {criticalPatterns.length > 0 && (
          <div className="space-y-1">
            {criticalPatterns.map((pattern: any, index: number) => (
              <div key={`critical-${index}`} className="flex items-start gap-2 text-xs text-red-500">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                <span>
                  <strong>{pattern.token}</strong>: {pattern.description}
                </span>
              </div>
            ))}
          </div>
        )}
        {warningPatterns.length > 0 && (
          <div className="space-y-1">
            {warningPatterns.map((pattern: any, index: number) => (
              <div key={`warning-${index}`} className="flex items-start gap-2 text-xs text-amber-500">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                <span>
                  <strong>{pattern.token}</strong>: {pattern.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className={cn(
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-primary" />
            <CardTitle className="text-lg">AI-Powered Suggestions</CardTitle>
          </div>
          
          {showCustomization && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCustomization(false)}
              className="text-xs"
            >
              <Check size={14} className="mr-1" /> Back to AI Suggestion
            </Button>
          )}
        </div>
        <CardDescription>
          Smart password analysis and enhancement based on your input
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="h-[180px] flex items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-primary/70" />
          </div>
        ) : (
          <>
            <Tabs 
              defaultValue="suggestion" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="suggestion">Analysis</TabsTrigger>
                <TabsTrigger value="generation">Password Gen</TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggestion" className="mt-0">
                {/* Why is this password vulnerable */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>Vulnerability analysis:</span>
                  </h4>
                  <ul className="space-y-1.5 pl-5 list-disc text-sm text-slate-700">
                    {reasoning.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
                
                {/* AI Suggestions */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <BadgeCheck size={14} className="text-primary" />
                    <span>Improvement suggestions:</span>
                  </h4>
                  <ul className="space-y-1.5 pl-5 list-disc text-sm text-slate-700">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Improved password suggestion */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">AI-generated strong alternative:</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab("generation")}
                      className="text-xs"
                    >
                      <Settings size={14} className="mr-1.5" />
                      <span className="text-xs">Customize</span>
                    </Button>
                  </div>
                  
                  {isChecking || regenerating ? (
                    <div className="flex items-center gap-3 mb-2 text-sm">
                      <RefreshCw size={14} className="animate-spin text-primary" />
                      <span className="text-slate-600">
                        {regenerating ? 
                          "Password found in breach database. Finding safer alternative..." : 
                          "Checking breach status..."}
                      </span>
                    </div>
                  ) : isBreached ? (
                    <div className="flex items-center gap-2 mb-2 text-sm text-amber-600">
                      <AlertTriangle size={14} />
                      <span>Found in breach database! Try regenerating.</span>
                    </div>
                  ) : breachCheckCompleted && currentPassword ? (
                    <div className="flex items-center gap-2 mb-2 text-sm text-emerald-600">
                      <Shield size={14} />
                      <span>Not found in known breach databases</span>
                    </div>
                  ) : null}
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white px-4 py-2 rounded-md border border-slate-200 flex-grow font-mono text-sm flex justify-between overflow-x-auto">
                      <span className="whitespace-nowrap">{showPassword ? currentPassword : currentPassword.replace(/./g, '•')}</span>
                      <button 
                        className="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 whitespace-nowrap"
                        aria-label="Copy improved password"
                        disabled={isChecking || regenerating}
                      >
                        {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
                        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={regeneratePassword}
                        className="flex items-center gap-1.5 whitespace-nowrap"
                        aria-label="Regenerate password"
                        disabled={isChecking || regenerating}
                      >
                        <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Regenerate</span>
                      </Button>
                    </div>
                  </div>
                  
                  {advancedAnalysis && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Strength</span>
                        <span className={getStrengthColor(advancedAnalysis.score)}>
                          Score: {advancedAnalysis.score}/4
                        </span>
                      </div>
                      <Progress 
                        value={advancedAnalysis.score * 25} 
                        className="h-1.5" 
                        indicatorClassName={cn(
                          advancedAnalysis.score < 2 ? "bg-strength-weak" :
                          advancedAnalysis.score < 3 ? "bg-strength-fair" :
                          "bg-strength-good"
                        )}
                      />

                      {renderPatternsFound()}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="generation" className="mt-0">
                <div>
                  <h4 className="text-sm font-medium mb-3">Customize your password:</h4>
                  
                  <div className="space-y-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-length" className="text-xs">Length: {passwordSettings.length}</Label>
                      </div>
                      <Slider 
                        id="password-length"
                        value={[passwordSettings.length]} 
                        min={8} 
                        max={32} 
                        step={1} 
                        onValueChange={(value) => setPasswordSettings({...passwordSettings, length: value[0]})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="uppercase" 
                          checked={passwordSettings.includeUppercase}
                          onCheckedChange={(checked) => 
                            setPasswordSettings({...passwordSettings, includeUppercase: checked === true})
                          }
                        />
                        <Label htmlFor="uppercase" className="text-xs">Uppercase (A-Z)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="lowercase" 
                          checked={passwordSettings.includeLowercase}
                          onCheckedChange={(checked) => 
                            setPasswordSettings({...passwordSettings, includeLowercase: checked === true})
                          }
                        />
                        <Label htmlFor="lowercase" className="text-xs">Lowercase (a-z)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="numbers" 
                          checked={passwordSettings.includeNumbers}
                          onCheckedChange={(checked) => 
                            setPasswordSettings({...passwordSettings, includeNumbers: checked === true})
                          }
                        />
                        <Label htmlFor="numbers" className="text-xs">Numbers (0-9)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="symbols" 
                          checked={passwordSettings.includeSymbols}
                          onCheckedChange={(checked) => 
                            setPasswordSettings({...passwordSettings, includeSymbols: checked === true})
                          }
                        />
                        <Label htmlFor="symbols" className="text-xs">Symbols (!@#$)</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Password strength meter */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Strength</span>
                      {advancedAnalysis && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className={getStrengthColor(advancedAnalysis.score)}>
                              Score: {advancedAnalysis?.score}/4
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>zxcvbn score: {advancedAnalysis?.score}/4</p>
                              <p>Guesses (log10): {advancedAnalysis?.guessesLog10.toFixed(1)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <Progress 
                      value={advancedAnalysis ? advancedAnalysis.score * 25 : 0} 
                      className="h-1.5" 
                      indicatorClassName={cn(
                        advancedAnalysis && advancedAnalysis.score < 2 ? "bg-strength-weak" :
                        advancedAnalysis && advancedAnalysis.score < 3 ? "bg-strength-fair" :
                        "bg-strength-good"
                      )}
                    />
                    
                    {renderPatternsFound()}
                    
                    {advancedAnalysis && advancedAnalysis.hardwareEstimates && (
                      <div className="mt-3 space-y-1 text-xs p-2 bg-slate-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">Estimated crack times:</span>
                        </div>
                        <div className="grid gap-1">
                          <div className="flex justify-between">
                            <span>CPU (bcrypt):</span>
                            <span className="font-mono">{advancedAnalysis.hardwareEstimates.cpu}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Normal GPU:</span>
                            <span className="font-mono">{advancedAnalysis.hardwareEstimates.normalGpu}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>High-End GPU:</span>
                            <span className="font-mono">{advancedAnalysis.hardwareEstimates.highEndGpu}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="relative flex-grow">
                      <Input 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="font-mono pr-10"
                        type={showPassword ? "text" : "password"}
                      />
                      <button 
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={regeneratePassword}
                      className="shrink-0"
                      aria-label="Regenerate password"
                      disabled={isChecking || regenerating}
                    >
                      <RefreshCw size={14} className={cn("mr-1.5", regenerating && "animate-spin")} />
                      <span>Generate</span>
                    </Button>
                  </div>
                  
                  {isChecking ? (
                    <div className="flex items-center gap-3 mb-3 text-sm">
                      <RefreshCw size={14} className="animate-spin text-primary" />
                      <span className="text-slate-600">Checking breach status...</span>
                    </div>
                  ) : isBreached ? (
                    <div className="flex items-center gap-2 mb-3 text-sm text-amber-600">
                      <AlertTriangle size={14} />
                      <span>This password appears in known breach databases!</span>
                    </div>
                  ) : currentPassword && breachCheckCompleted ? (
                    <div className="flex items-center gap-2 mb-3 text-sm text-emerald-600">
                      <Shield size={14} />
                      <span>Not found in known breach databases</span>
                    </div>
                  ) : null}
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-1.5"
                    aria-label="Copy customized password"
                    disabled={isChecking || regenerating}
                  >
                    {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied to Clipboard" : "Copy to Clipboard"}</span>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
