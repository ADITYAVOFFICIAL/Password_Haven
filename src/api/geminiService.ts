// import { GEMINI_API_KEY, GEMINI_MODEL, AI_SYSTEM_PROMPT, BREACH_DATABASES } from "@/constants/config";

// /**
//  * Interface for Gemini API response structure expected from the model
//  */
// interface GeminiAnalysisResult {
//   suggestions: string[];
//   reasoning: string[];
//   improvedPassword: string;
// }

// /**
//  * Interface for the raw response structure from the Gemini API endpoint
//  */
// interface GeminiApiResponse {
//   candidates: Array<{
//     content: {
//       parts: Array<{
//         text: string;
//       }>;
//       role: string;
//     };
//     finishReason: string; // e.g., "STOP", "MAX_TOKENS", "SAFETY"
//     index: number;
//     // safetyRatings might also be present
//   }>;
//   // promptFeedback might also be present
//   usageMetadata?: { // Added optional chaining as it might not always be present
//       promptTokenCount: number;
//       candidatesTokenCount: number;
//       totalTokenCount: number;
//   }
// }


// /**
//  * Analyzes a password using Google's Gemini AI model
//  * @param password The password string to analyze
//  * @returns A Promise resolving to the analysis results or a mock response on failure
//  */
// export async function analyzePasswordWithGemini(password: string): Promise<GeminiAnalysisResult> {
//   // console.log(`Analyzing password (length ${password.length}) with Gemini...`); // Log start

//   // Ensure API key is available
//   if (!GEMINI_API_KEY) {
//     console.warn("No Gemini API key provided. Using mock response."); // Use warn for missing config
//     return getMockGeminiResponse(password);
//   }

//   const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

//   // Refined prompt emphasizing JSON-only output
//   const prompt = `
// Analyze this password in detail: "${password}"

// Provide:
// 1. Three specific, actionable suggestions to improve this password with concrete examples relevant to the original password's weaknesses.
// 2. Brief reasoning (max 2 points) explaining its vulnerabilities and potential attack methods (e.g., brute-force, dictionary attack, credential stuffing).
// 3. A stronger alternative password derived from the original concept but significantly enhanced for security (longer, more complex, less predictable).

// Consider:
// - Length, character set diversity (uppercase, lowercase, numbers, symbols).
// - Common patterns, dictionary words, substitutions (e.g., a->@, s->$).
// - Potential presence in breach databases (like RockYou).
// - Estimated time to crack (conceptual, e.g., "seconds", "years").
// - Modern password security best practices.

// Format your entire response *strictly* as a valid JSON object matching this structure:
// {
//   "suggestions": ["suggestion1: example", "suggestion2: example", "suggestion3: example"],
//   "reasoning": ["reasoning1", "reasoning2"],
//   "improvedPassword": "stronger-password-suggestion"
// }

// IMPORTANT: Respond ONLY with the raw JSON object. Do not include any introductory text, explanations outside the JSON structure, markdown formatting (like \`\`\`json), or any other text.
// `;

//   try {
//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               { text: prompt }
//             ]
//           }
//         ],
//         // systemInstruction might be useful for overall behavior, ensure AI_SYSTEM_PROMPT is defined
//         ...(AI_SYSTEM_PROMPT && {
//             systemInstruction: {
//                 parts: [ { text: AI_SYSTEM_PROMPT } ]
//             }
//         }),
//         generationConfig: {
//           temperature: 0.3, // Slightly increased for potentially more creative suggestions
//           topK: 40,
//           topP: 0.95,
//           maxOutputTokens: 2048, // *** Increased token limit ***
//           responseMimeType: "application/json" // Request JSON output directly
//         }
//       }),
//     });

//     if (!response.ok) {
//       // Log more detailed error info if possible
//       let errorBody = "Could not read error body";
//       try {
//           errorBody = await response.text();
//       } catch (_) { /* ignore inability to read body */ }
//       console.error(`Gemini API request failed: ${response.status} ${response.statusText}. Body: ${errorBody}`);
//       return getMockGeminiResponse(password);
//     }

//     const data: GeminiApiResponse = await response.json();
//     // console.log("Raw Gemini Response Data:", JSON.stringify(data, null, 2)); // Detailed log for debugging

//     // --- Check for valid candidate and finish reason ---
//     const candidate = data.candidates?.[0];
//     if (!candidate) {
//         console.error("Gemini response missing candidates array.");
//         return getMockGeminiResponse(password);
//     }

//     // *** Explicitly check for MAX_TOKENS finish reason ***
//     if (candidate.finishReason === "MAX_TOKENS") {
//         console.warn(`Gemini response truncated due to MAX_TOKENS (${data.usageMetadata?.candidatesTokenCount}/${data.generationConfig?.maxOutputTokens} used). Falling back to mock response.`);
//         return getMockGeminiResponse(password);
//     }

//     // Other non-STOP reasons might also indicate issues
//     if (candidate.finishReason !== "STOP" && candidate.finishReason !== "MODEL_LENGTH") { // MODEL_LENGTH can sometimes be used instead of STOP
//         console.warn(`Gemini response finished with reason: ${candidate.finishReason}. Proceeding, but result might be unexpected.`);
//         // Optionally, you could return mock here too for safety reasons:
//         // return getMockGeminiResponse(password);
//     }

//     let textResponse = candidate.content?.parts?.[0]?.text;

//     if (!textResponse) {
//         console.error("Gemini response candidate missing text content.");
//         return getMockGeminiResponse(password);
//     }

//     // --- Attempt to parse the JSON response ---
//     try {
//       // Clean the response string - remove potential markdown and trim whitespace
//       textResponse = textResponse.trim();
//       if (textResponse.startsWith("```json")) {
//         textResponse = textResponse.substring(7); // Remove ```json\n
//         if (textResponse.endsWith("```")) {
//           textResponse = textResponse.substring(0, textResponse.length - 3); // Remove ```
//         }
//         textResponse = textResponse.trim(); // Trim again
//       }

//       // Check if the cleaned string looks like JSON before parsing
//       if (!textResponse.startsWith("{") || !textResponse.endsWith("}")) {
//           console.error("Gemini text response does not appear to be a valid JSON object after cleaning:", textResponse);
//           // Attempt to find JSON within the string as a last resort (like the original code did)
//           const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
//           if (jsonMatch) {
//               console.warn("Attempting to parse extracted JSON-like block from response.");
//               textResponse = jsonMatch[0];
//           } else {
//               // If still not looking like JSON, fallback
//               return getMockGeminiResponse(password);
//           }
//       }


//       const parsedResponse: GeminiAnalysisResult = JSON.parse(textResponse);

//       // Basic validation of the parsed structure
//       if (!parsedResponse || typeof parsedResponse !== 'object' || !Array.isArray(parsedResponse.suggestions) || !Array.isArray(parsedResponse.reasoning) || typeof parsedResponse.improvedPassword !== 'string') {
//           console.error("Parsed Gemini response does not match expected structure:", parsedResponse);
//           return getMockGeminiResponse(password);
//       }

//       // console.log("Successfully parsed Gemini response.");
//       return {
//         suggestions: parsedResponse.suggestions || [],
//         reasoning: parsedResponse.reasoning || [],
//         // Provide a fallback improved password if Gemini fails to generate one
//         improvedPassword: parsedResponse.improvedPassword || generateImprovedPassword(password)
//       };

//     } catch (parseError) {
//       console.error("Failed to parse Gemini JSON response:", parseError);
//       console.error("--- Text Response that failed parsing ---");
//       console.error(textResponse); // Log the exact text that failed
//       console.error("--------------------------------------");
//       return getMockGeminiResponse(password);
//     }

//   } catch (error) {
//     console.error("Error calling Gemini API or processing response:", error);
//     return getMockGeminiResponse(password);
//   }
// }

// // =====================================================
// // Mock Response Functions (kept mostly the same)
// // =====================================================

// /**
//  * Provides fallback mock analysis when Gemini API is not available or fails
//  */
// function getMockGeminiResponse(password: string): GeminiAnalysisResult {
//   // console.log("Generating mock analysis for password."); // Log when mock is used
//   const hasUpper = /[A-Z]/.test(password);
//   const hasLower = /[a-z]/.test(password);
//   const hasNumber = /[0-9]/.test(password);
//   const hasSpecial = /[^A-Za-z0-9]/.test(password);
//   const length = password.length;
//   // Slightly expanded common word list
//   const commonWordRegex = /password|12345|qwerty|welcome|admin|login|letmein|football|baseball|dragon|shadow|sunshine|monkey/i;
//   const hasCommonWord = commonWordRegex.test(password);
//   const isSequential = /abc|bcd|cde|def|efg|fgh|ghi|123|234|345|456|567|678|789/.test(password.toLowerCase());

//   const suggestions: string[] = [];
//   const reasoning: string[] = [];

//   // Suggestions
//   if (length < 12) {
//     suggestions.push(`Increase length: Add at least ${12 - length} more characters. Aim for 12-16+. Example: "${password}${generateRandomSuffix(Math.max(4, 12 - length))}"`);
//   } else if (length < 16) {
//       suggestions.push(`Consider increasing length further: Longer passwords (16+) significantly increase cracking time. Example: "${password}${generateRandomSuffix(3)}"`);
//   }

//   if (!hasUpper) {
//     const withUpper = password.length > 0 ? password.charAt(0).toUpperCase() + password.slice(1) : "PassW";
//     suggestions.push(`Add uppercase letters: Mix upper and lower case. Example: "${withUpper}${generateRandomSuffix(1)}"`);
//   }

//   if (!hasLower && hasUpper) { // Only suggest adding lower if there are *only* upper (or non-letters)
//     suggestions.push(`Add lowercase letters: Mix upper and lower case for complexity.`);
//   }

//   if (!hasNumber) {
//       const num = Math.floor(Math.random() * 10);
//       suggestions.push(`Include numbers: Insert numbers in non-obvious positions. Example: "${password.slice(0,1)}${num}${password.slice(1)}"`);
//   }

//   if (!hasSpecial) {
//     const special = "!@#$%^&*".charAt(Math.floor(Math.random() * 8));
//     suggestions.push(`Add special characters: Include symbols like !@#$%^&*. Example: "${password}${special}"`);
//   }

//   if (hasCommonWord) {
//     suggestions.push(`Avoid common words/names: Replace "${password.match(commonWordRegex)?.[0]}" with less predictable terms or use a passphrase.`);
//   }

//   if (isSequential) {
//       suggestions.push("Avoid sequential characters: Sequences like 'abc' or '123' are easy patterns to guess.");
//   }

//   // Fill suggestions if needed
//   while (suggestions.length < 3) {
//     suggestions.push(
//       suggestions.includes("Use a password manager") ? "Enable Multi-Factor Authentication (MFA) wherever possible." : "Use a password manager: Generate and store unique, strong passwords for each site."
//     );
//   }

//   // Reasoning
//   if (length < 10) {
//       reasoning.push(`Short length (${length} chars): Makes it vulnerable to modern brute-force attacks (potentially minutes/hours).`);
//   } else {
//       reasoning.push(`Length is moderate/good (${length} chars), but complexity matters.`);
//   }

//   let complexityIssues = [];
//   if (!hasUpper) complexityIssues.push("missing uppercase");
//   if (!hasLower && hasUpper) complexityIssues.push("missing lowercase"); // Only if primarily upper
//   if (!hasNumber) complexityIssues.push("missing numbers");
//   if (!hasSpecial) complexityIssues.push("missing special chars");

//   if (complexityIssues.length > 0) {
//       reasoning.push(`Limited character set (${complexityIssues.join(', ')}): Reduces the search space for attackers.`);
//   }

//   if (hasCommonWord || isSequential) {
//       reasoning.push("Predictable patterns: Contains common words or sequences found in dictionary attacks or rule-based cracking.");
//   }

//    // Fill reasoning if needed
//   while (reasoning.length < 2) {
//     reasoning.push(
//       reasoning.includes("Password reuse risk") ? "Could be susceptible to phishing if simple." : "Password reuse risk: If used elsewhere, a breach on one site could compromise others (credential stuffing)."
//     );
//   }


//   return {
//     suggestions: suggestions.slice(0, 3),
//     reasoning: reasoning.slice(0, 2),
//     improvedPassword: generateImprovedPassword(password) // Use the existing improved password generator
//   };
// }

// /**
//  * Generates a potentially improved password based on the original, aiming for common rules.
//  * Note: This is a *basic* generator for mock/fallback, not cryptographically secure random generation.
//  */
// function generateImprovedPassword(original: string): string {
//   if (original.length === 0) {
//     return "R@nd0mP#ssW0rd!"; // A reasonable default
//   }

//   let improved = original;

//   // Ensure minimum length
//   if (improved.length < 12) {
//     improved += generateRandomSuffix(12 - improved.length);
//   }

//   // Ensure character type diversity
//   if (!/[A-Z]/.test(improved)) {
//     const i = Math.floor(Math.random() * improved.length);
//     const char = improved[i].toLowerCase();
//     // Try replacing a lowercase letter with uppercase, otherwise append
//     if (char >= 'a' && char <= 'z') {
//       improved = improved.substring(0, i) + char.toUpperCase() + improved.substring(i + 1);
//     } else {
//         improved += 'T'; // Append if no letters to change
//     }
//   }
//   if (!/[a-z]/.test(improved)) {
//      improved += 's'; // Append lowercase if missing
//   }
//   if (!/[0-9]/.test(improved)) {
//     const i = Math.floor(Math.random() * (improved.length + 1)); // Allow appending
//     improved = improved.substring(0, i) + Math.floor(Math.random() * 10) + improved.substring(i);
//   }
//   if (!/[^A-Za-z0-9]/.test(improved)) {
//      const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
//      const i = Math.floor(Math.random() * (improved.length + 1)); // Allow appending
//      improved = improved.substring(0, i) + specialChars.charAt(Math.floor(Math.random() * specialChars.length)) + improved.substring(i);
//   }

//    // Simple substitutions (apply sparingly)
//    let subCount = 0;
//    const maxSubs = 2;
//    improved = improved.split('').map(char => {
//        if (subCount < maxSubs && Math.random() < 0.3) { // ~30% chance per char, up to maxSubs
//            const subs: Record<string, string> = { 'a': '@', 'e': '3', 'i': '1', 'o': '0', 's': '$', 'l': '!', 't': '7' };
//            if (subs[char.toLowerCase()]) {
//                subCount++;
//                return subs[char.toLowerCase()];
//            }
//        }
//        return char;
//    }).join('');

//   // Ensure final length is still reasonable if substitutions shortened it (unlikely)
//   if (improved.length < 12) {
//       improved += generateRandomSuffix(12 - improved.length);
//   }

//   return improved.slice(0, 24); // Cap length reasonably
// }

// /**
//  * Generates a random string suffix of specified length using a wider charset.
//  */
// function generateRandomSuffix(length: number): string {
//   // Expanded charset for better randomness in suffixes
//   const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*-_=+';
//   let result = '';
//   // Use crypto.getRandomValues for better randomness if available in the environment (browser/node)
//   if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
//       const randomValues = new Uint32Array(length);
//       crypto.getRandomValues(randomValues);
//       for (let i = 0; i < length; i++) {
//           result += chars.charAt(randomValues[i] % chars.length);
//       }
//   } else {
//       // Fallback to Math.random (less secure but works everywhere)
//       console.warn("Using Math.random for suffix generation, crypto.getRandomValues not available.");
//       for (let i = 0; i < length; i++) {
//           result += chars.charAt(Math.floor(Math.random() * chars.length));
//       }
//   }
//   return result;
// }


// // --- Make sure you have these constants defined somewhere, e.g., in "@/constants/config" ---
// /*
// // Example constants/config.ts
// export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE"; // Replace with your actual key loading method
// export const GEMINI_MODEL = "gemini-1.5-flash-latest"; // Or "gemini-1.5-pro-latest", or the specific one you were using "gemini-2.5-pro-exp-03-25" if intended
// export const AI_SYSTEM_PROMPT = "You are a helpful AI assistant specializing in password security analysis. Provide clear, concise, and actionable advice. Respond ONLY in the requested JSON format."; // Example System Prompt
// export const BREACH_DATABASES = ["RockYou", "LinkedIn", "Adobe", "HaveIBeenPwned"]; // Example list
// */