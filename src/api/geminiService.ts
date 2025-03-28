import { GEMINI_API_KEY, GEMINI_MODEL, AI_SYSTEM_PROMPT, BREACH_DATABASES } from "@/constants/config";

/**
 * Interface for Gemini API response
 */
interface GeminiResponse {
  suggestions: string[];
  reasoning: string[];
  improvedPassword: string;
}

/**
 * Analyzes a password using Google's Gemini AI model
 */
export async function analyzePasswordWithGemini(password: string): Promise<GeminiResponse> {
  try {
    // Ensure API key is available
    if (!GEMINI_API_KEY) {
      console.error("No Gemini API key provided");
      return getMockGeminiResponse(password);
    }
    
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + 
                   `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
    Analyze this password in detail: "${password}"
    
    Provide:
    1. Three specific ways to improve this password with concrete examples
    2. Brief reasoning on why it's vulnerable and what specific attack methods could compromise it
    3. A stronger alternative password based on the original but with much higher entropy
    
    Consider:
    - Patterns from common breach databases like RockYou, LinkedIn, Adobe
    - Dictionary words and common substitutions
    - Time to crack using modern hashing algorithms (bcrypt, SHA-256)
    - Best practices for modern password security
    
    Format your response as JSON:
    {
      "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
      "reasoning": ["reason1", "reason2"],
      "improvedPassword": "stronger-password-suggestion"
    }
    
    Respond ONLY with the JSON object, no additional text.
    `;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            { text: AI_SYSTEM_PROMPT }
          ]
        },
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      return getMockGeminiResponse(password);
    }

    const data = await response.json();
    
    // Extract the JSON response from the text
    let textResponse = data.candidates[0]?.content?.parts[0]?.text || "";
    
    // In case the model returned text around the JSON, try to extract just the JSON part
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      textResponse = jsonMatch[0];
    }
    
    try {
      const parsedResponse = JSON.parse(textResponse);
      return {
        suggestions: parsedResponse.suggestions || [],
        reasoning: parsedResponse.reasoning || [],
        improvedPassword: parsedResponse.improvedPassword || generateImprovedPassword(password)
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return getMockGeminiResponse(password);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return getMockGeminiResponse(password);
  }
}

/**
 * Provides fallback mock responses when Gemini API is not available
 */
function getMockGeminiResponse(password: string): GeminiResponse {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const length = password.length;
  const hasCommonWord = /password|123456|qwerty|welcome|admin|login|letmein|football|baseball|dragon/i.test(password);
  
  const suggestions = [];
  const reasoning = [];
  
  // More sophisticated suggestions
  if (length < 12) {
    suggestions.push(`Increase length to at least 12 characters (e.g., "${password}${generateRandomSuffix(4)}")`);
    reasoning.push(`Short passwords (${length} chars) are vulnerable to brute force attacks - modern GPUs can crack ${length}-character passwords in minutes to hours`);
  }
  
  if (!hasUpper) {
    const withUpper = password.replace(/[a-z]/, (m) => m.toUpperCase());
    suggestions.push(`Add uppercase letters (e.g., "${withUpper}")`);
  }
  
  if (!hasLower && !hasUpper) {
    suggestions.push(`Add lowercase letters for complexity`);
  }
  
  if (!hasNumber) {
    suggestions.push(`Include numbers in unpredictable positions (not just at the end)`);
  }
  
  if (!hasSpecial) {
    const withSpecial = password + "!@#";
    suggestions.push(`Add special characters (e.g., "${withSpecial.slice(0, password.length + 1)}")`);
  }
  
  if (hasCommonWord) {
    suggestions.push("Replace common words with random combinations or passphrases");
    reasoning.push(`Contains patterns found in the ${BREACH_DATABASES[0]} and ${BREACH_DATABASES[1]} breach datasets`);
  }
  
  // Add reasoning about specific attacks
  if (length < 10 && (!hasSpecial || !hasNumber)) {
    reasoning.push("Vulnerable to dictionary attacks with common substitutions (a→4, e→3, i→1)");
  }
  
  if (/^\d+$/.test(password)) {
    reasoning.push("Pure numeric passwords are extremely vulnerable to brute force attacks");
  }
  
  if (length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial) {
    reasoning.push("Even complex passwords should not be reused across sites - use a password manager");
  }
  
  // Fill in with generic suggestions if needed
  if (suggestions.length < 3) {
    suggestions.push(
      "Use a random password generator for maximum security",
      "Consider using a passphrase of 4+ random words with symbols between them",
      "Avoid personal information like birthdates or names of pets"
    );
  }
  
  // Fill in with generic reasoning if needed
  while (reasoning.length < 2) {
    reasoning.push(
      "Password could be compromised through credential stuffing if used on multiple sites",
      "Modern password cracking tools use sophisticated rules based on human password patterns"
    );
  }
  
  return {
    suggestions: suggestions.slice(0, 3),
    reasoning: reasoning.slice(0, 2),
    improvedPassword: generateImprovedPassword(password)
  };
}

/**
 * Generates an improved password based on the original
 */
function generateImprovedPassword(original: string): string {
  // This is a more sophisticated implementation than before
  if (original.length === 0) {
    return "Tr0ub4dor&3";  // XKCD reference as fallback
  }
  
  let improved = original;
  const hasLower = /[a-z]/.test(improved);
  const hasUpper = /[A-Z]/.test(improved);
  const hasNumber = /[0-9]/.test(improved);
  const hasSpecial = /[^A-Za-z0-9]/.test(improved);
  
  // Make sure it has sufficient length
  if (improved.length < 12) {
    // Add more characters while keeping some resemblance to original
    const extraLength = 12 - improved.length;
    improved = improved + generateRandomSuffix(extraLength);
  }
  
  // Add complexity if missing specific character types
  if (!hasUpper) {
    // Capitalize a random letter
    const letters = improved.match(/[a-z]/g);
    if (letters && letters.length > 0) {
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      improved = improved.replace(randomLetter, randomLetter.toUpperCase());
    } else {
      improved = improved + "K";
    }
  }
  
  if (!hasLower && !hasUpper) {
    // No letters at all, add some
    improved = improved + "xYz";
  }
  
  if (!hasNumber) {
    // Insert a random number at a random position
    const randomPos = Math.floor(Math.random() * improved.length);
    const randomNum = Math.floor(Math.random() * 10);
    improved = improved.slice(0, randomPos) + randomNum + improved.slice(randomPos);
  }
  
  if (!hasSpecial) {
    // Insert a random special character at a random position
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const randomPos = Math.floor(Math.random() * improved.length);
    const randomChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    improved = improved.slice(0, randomPos) + randomChar + improved.slice(randomPos);
  }
  
  // Substitute some characters to add complexity, but not too many
  // to keep some resemblance to the original
  const substitutions: Record<string, string> = {
    'a': '@', 'e': '3', 'i': '!', 'o': '0', 's': '$', 'l': '1', 't': '7'
  };
  
  // Only apply substitutions to a maximum of 2 characters
  let subsCount = 0;
  for (const [char, replacement] of Object.entries(substitutions)) {
    if (subsCount >= 2) break;
    
    // Only replace the first occurrence with 50% probability
    if (improved.includes(char) && Math.random() > 0.5) {
      improved = improved.replace(char, replacement);
      subsCount++;
    }
  }
  
  return improved;
}

/**
 * Generates a random string of specified length
 */
function generateRandomSuffix(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
