// src/api/ollamaService.ts

// Define the structure of the analysis result we expect back from the backend
// This should match the AnalysisResponse Pydantic model in main.py
// We can reuse the Gemini interface name if the structure is identical, or define a new one.
// Using a distinct name like AiAnalysisResult might be clearer if structures diverge later.
export interface AiAnalysisResult {
  suggestions: string[];
  reasoning: string[];
  improvedPassword: string; // Ensure field names match backend response
}
export interface PasswordAnalysisContext {
  score: number; // zxcvbn score 0-4
  entropy: number; // bits
  composition: {
    total: number;
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
  };
  crackTimeEstimates: {
    bruteForce: string; // Human-readable (e.g., "15 minutes", "+300 years")
    smartGuessing: string; // Human-readable
    hardware: {
      cpu: string;
      normalGpu: string;
      highEndGpu: string;
    };
  };
  // Optional: Add other relevant fields like detected patterns if needed
  // patterns?: { type: string; token: string; description: string; severity: string }[];
}

// The URL where your Python FastAPI backend is running
const OLLAMA_BACKEND_URL = "http://127.0.0.1:8000/ollama/generateContent"; // Default backend endpoint

/**
 * Analyzes a password by sending it to the local Ollama FastAPI backend.
 * @param password The password string to analyze.
 * @param analysisContext Detailed analysis metrics calculated client-side. <--- NEW PARAMETER
 * @returns A Promise resolving to the analysis results or a fallback mock response on failure.
 */
export async function analyzePasswordWithOllama(
  password: string,
  analysisContext: PasswordAnalysisContext // <--- USE THE INTERFACE
): Promise<AiAnalysisResult> {
  await new Promise(resolve => setTimeout(resolve, 200));
  // console.log("Sending password to Ollama backend for analysis..."); // Log initiation
  const totalChars = analysisContext.composition.total || 1; // Prevent division by zero
  const upperPercent = ((analysisContext.composition.uppercase / totalChars) * 100).toFixed(0);
  const lowerPercent = ((analysisContext.composition.lowercase / totalChars) * 100).toFixed(0);
  const numberPercent = ((analysisContext.composition.numbers / totalChars) * 100).toFixed(0);
  const symbolPercent = ((analysisContext.composition.symbols / totalChars) * 100).toFixed(0);
  // console.log("Password stats received:", {
  //   total: analysisContext.composition.total,
  //   uppercase: analysisContext.composition.uppercase,
  //   lowercase: analysisContext.composition.lowercase,
  //   numbers: analysisContext.composition.numbers,
  //   symbols: analysisContext.composition.symbols
  // });
  const contextString = `
**Password Analysis Context (Client-Side Calculation):**
*   **Strength Score (zxcvbn):** ${analysisContext.score}/4
*   **Entropy:** ${analysisContext.entropy.toFixed(1)} bits
*   **Character Composition (${analysisContext.composition.total} total):**
    *   Uppercase: ${analysisContext.composition.uppercase} (${upperPercent}%)
    *   Lowercase: ${analysisContext.composition.lowercase} (${lowerPercent}%)
    *   Numbers: ${analysisContext.composition.numbers} (${numberPercent}%)
    *   Symbols: ${analysisContext.composition.symbols} (${symbolPercent}%)
*   **Estimated Time to Crack (zxcvbn):**
    *   Brute Force (Offline Slow Hash): ${analysisContext.crackTimeEstimates.bruteForce}
    *   Smart Guessing (Offline Fast Hash): ${analysisContext.crackTimeEstimates.smartGuessing}
*   **Hardware-Specific Estimates (bcrypt):**
    *   Standard CPU: ${analysisContext.crackTimeEstimates.hardware.cpu}
    *   Normal GPU: ${analysisContext.crackTimeEstimates.hardware.normalGpu}
    *   High-End GPU: ${analysisContext.crackTimeEstimates.hardware.highEndGpu}
`;
 // Log the context string for debugging
//  console.log(contextString); // Log the context string for debugging
  
  // Add a small delay to ensure all stats and details are collected before proceeding
 
  // Construct the prompt for the Ollama model
  // This should match the prompt your phi3-mini model is fine-tuned or instructed to handle.
  // NOTE: You still replace ${contextString} and ${password} dynamically later.
const prompt = `<|start_header_id|>system<|end_header_id|>
You are a sophisticated AI Password Security Analyst adhering to enterprise security standards. Your primary function is to perform a comprehensive security assessment of provided passwords, leveraging detailed client-side context (including quantitative metrics like zxcvbn scores, entropy, crack times, composition analysis) and awareness of common password patterns found in breached datasets (like RockYou). Your analysis must culminate in actionable, context-aware recommendations.

**Mandatory Output Constraint: Raw JSON Object Only**
*   Your entire response **MUST** be a single, syntactically valid JSON object.
*   The response **MUST** start with '{' and end with '}'.
*   **ABSOLUTELY NO** introductory text, concluding remarks, explanations, apologies, markdown formatting (like \\\`\\\`\\\`json), or any characters outside the defined JSON structure are permitted.

**Core Task:** Analyze the input password using the provided context string. Generate a JSON object containing:
1.  Three distinct, actionable improvement suggestions with concrete examples.
2.  Two primary reasoning points identifying the most critical vulnerabilities, explicitly justified by the provided context metrics and potential breach status, detailing the associated attack vectors.
3.  A securely generated, random 16-character improved password meeting strict complexity criteria.

**JSON Schema Definition (Strict Adherence Required):**
\\\`\\\`\\\`json
{
  "suggestions": [
    "string: Actionable suggestion 1 addressing a key weakness, with a concrete example.",
    "string: Actionable suggestion 2 addressing another key weakness, with a concrete example.",
    "string: Actionable suggestion 3 offering further enhancement (e.g., length, complexity, pattern avoidance), with a concrete example."
  ],
  "reasoning": [
    "string: Explanation of the #1 most critical vulnerability (e.g., found in breach lists, common pattern, insufficient length/complexity) justified with specific context metrics (score, entropy, crack time, composition) and naming the primary attack vector (e.g., Credential Stuffing, Dictionary Attack, Pattern-Based Cracking, Brute-Force).",
    "string: Explanation of the #2 most critical vulnerability, similarly justified with context metrics and naming the relevant attack vector."
  ],
  "improvedPassword": "string: A generated secure password, EXACTLY 16 characters long, meeting all generation criteria (see below)."
}
\\\`\\\`\\\`

**Password Analysis Guidelines & Factors:**
1.  **Breached Dataset Check:** Critically assess if the password is known in breaches. Leverage \\\`contextString.foundInBreachedDataset: boolean\\\` if provided. If not, *infer* likelihood based on extreme simplicity ('password', '123456'), common patterns, dictionary words, or common name/year combinations frequently found in breach corpuses. This is often the *highest priority* vulnerability.
2.  **Length:** Target >= 16 characters. Evaluate based on \\\`contextString.composition.total\\\`. Short passwords exponentially reduce brute-force time.
3.  **Character Complexity & Distribution:** Requires uppercase [A-Z], lowercase [a-z], numbers [0-9], *and* symbols (e.g., !@#$%^&*()). Check \\\`contextString.composition.*\\\` counts/percentages. Assess *diversity* of symbols used (not just one repeated symbol). Balanced distribution is better than clustering.
4.  **Pattern & Sequence Analysis:** Detect common English dictionary words, names, places. Identify keyboard walks (qwerty, asdf), numeric sequences (123, 987), character repetitions (aaa, 111), and predictable date/year patterns.
5.  **Predictable Substitutions (Leet Speak):** Identify common character-to-symbol swaps ('@' for 'a', '$' for 's', '1' for 'l', '0' for 'o', '3' for 'e'). These offer minimal security benefit against modern cracking tools.
6.  **Contextual Metrics Integration:** **Crucially leverage** the provided \\\`contextString\\\`. Low \\\`score\\\`/\`entropy\\\`, fast \\\`crackTimeEstimates\\\` (especially GPU estimates), or deficits in \\\`composition\\\` directly inform the reasoning and suggestions. High metrics indicate specific strengths. Link metrics explicitly to attack resistance (e.g., high entropy complicates brute-force).

**Internal Chain-of-Thought (CoT) Process (Follow rigorously; DO NOT output this CoT):**
1.  **Parse Input:** Identify the exact password string and parse the structured \\\`contextString\\\`.
2.  **Assess Breach Status:** Check for \\\`contextString.foundInBreachedDataset\\\`. If unavailable, infer breach likelihood based on commonality/patterns (Guideline #1). Note this finding immediately.
3.  **Analyze Length:** Compare \\\`composition.total\\\` against the 16+ character target. Note deficiency/sufficiency. Relate to brute-force resistance.
4.  **Analyze Complexity & Distribution:** Verify presence and count/percentage of all four character types via \\\`composition\\\`. Check symbol variety. Note imbalances. Relate to character set size for attacks.
5.  **Analyze Patterns & Substitutions:** Systematically scan for dictionary words, sequences, repetitions, keyboard patterns, common 'leet' substitutions. Note findings.
6.  **Synthesize Context & Findings:** Correlate all findings (breach status, length, complexity, patterns) with \\\`score\\\`, \\\`entropy\\\`, and \\\`crackTimeEstimates\\\`. *Determine the root causes* for the observed metrics. (e.g., "Score=0 and Crack Time <1s primarily due to inferred breach status/common dictionary word, secondarily due to lack of complexity").
7.  **Prioritize Vulnerabilities:** Identify the top 2-3 *most critical* weaknesses based on potential impact. Breach status/commonality is usually #1 if present/likely. Otherwise, prioritize severe length deficits, critical lack of complexity, or highly predictable patterns.
8.  **Formulate Reasoning (JSON \\\`reasoning\\\`):** Write exactly two concise strings. Each must: a) State the vulnerability, b) Justify it with *specific context metrics* (e.g., "entropy of 28.5 bits", "crack time < 1 sec on GPU", "0% symbols") and/or breach status, c) Name the primary attack vector enabled (e.g., "making it trivial for Credential Stuffing attacks", "highly susceptible to Dictionary Attacks", "reducing resilience against GPU-accelerated Brute-Force").
9.  **Formulate Suggestions (JSON \\\`suggestions\\\`):** Create exactly three distinct, actionable suggestions. Ensure they directly address the vulnerabilities identified in the reasoning. Provide concrete, illustrative examples for each. Aim for diversity in advice (length, complexity types, pattern avoidance).
10. **Generate Improved Password (JSON \\\`improvedPassword\\\`):** Create a cryptographically secure pseudo-random string that is **EXACTLY 16 characters** long. It **MUST** contain at least one character from each of these four groups: [a-z], [A-Z], [0-9], symbols. It **MUST** contain at least **two distinct** symbols (e.g., '#', '$' are distinct; '#', '#' are not). Ensure high visual randomness and no resemblance to the original password or common patterns.
11. **Assemble & Final Validate JSON:** Construct the final JSON object strictly according to the schema using the outputs from steps 8, 9, and 10. Perform a final check: Is it valid JSON? Does it start with '{' and end with '}'? Is there *any* extraneous text? Is the password exactly 16 chars and meets all criteria?

**Content Generation Rules Refined:**
1.  **\\\`suggestions\\\` Array:** Exactly 3 strings. Actionable, distinct, context-derived advice with clear examples. Directly mitigate points in \\\`reasoning\\\`.
2.  **\\\`reasoning\\\` Array:** Exactly 2 strings. Identify the *most severe* weaknesses, explicitly citing context data (metrics, breach likelihood) and naming the facilitated attack vector.
3.  **\\\`improvedPassword\\\` String:** EXACTLY 16 characters. Min 1 lowercase, 1 uppercase, 1 number, 2 *distinct* symbols. High randomness.

**--- Few-Shot Examples (Input -> Output) ---**

**Example 1 (Updated Reasoning):**
<|start_header_id|>user<|end_header_id|>
**Password Analysis Context (Client-Side Calculation):**
*   **Strength Score (zxcvbn):** 0/4
*   **Entropy:** 28.5 bits
*   **Character Composition (8 total):** Uppercase: 0 (0%), Lowercase: 8 (100%), Numbers: 0 (0%), Symbols: 0 (0%)
*   **Estimated Time to Crack (zxcvbn):** Brute Force (<1s), Smart Guessing (<1s)
*   **Hardware-Specific Estimates (bcrypt):** All <1 second
*   **Found in Breached Dataset (Hypothetical):** true

Execute analysis for password: "password"<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
{
  "suggestions": [
    "Increase length significantly to at least 16 characters using random characters. Example: 'R@nd0mP#r@s3Long!'",
    "Incorporate all character types: uppercase letters, numbers, and diverse symbols. Example: 'P@ssWord123!' uses all types but is still weak due to pattern.",
    "Completely avoid common dictionary words, especially 'password' itself. Example: Use unrelated words or random characters like 'DeskLampTree7^'."
  ],
  "reasoning": [
    "Extremely critical vulnerability due to being one of the most common passwords found in breached datasets (indicated by context/inference), making it susceptible to immediate compromise via Credential Stuffing and Dictionary Attacks.",
    "Insufficient length (8 chars) and complete lack of complexity (100% lowercase, 0% others) result in negligible entropy (28.5 bits) and crack times (<1 second) against any form of Brute-Force attack."
  ],
  "improvedPassword": "k9$Fg!uT3@vLp*Zq"
}
<|eot_id|>

**Example 2 (Updated Reasoning):**
<|start_header_id|>user<|end_header_id|>
**Password Analysis Context (Client-Side Calculation):**
*   **Strength Score (zxcvbn):** 1/4
*   **Entropy:** 35.1 bits
*   **Character Composition (9 total):** Uppercase: 1 (11%), Lowercase: 5 (56%), Numbers: 3 (33%), Symbols: 0 (0%)
*   **Estimated Time to Crack (zxcvbn):** Brute Force (3s), Smart Guessing (<1s)
*   **Hardware-Specific Estimates (bcrypt):** CPU (15m), Normal GPU (2s), High-End GPU (<1s)
*   **Found in Breached Dataset (Hypothetical):** false (but pattern is common)

Execute analysis for password: "Admin123"<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
{
  "suggestions": [
    "Increase password length to 16+ characters for significantly higher brute-force resistance. Example: 'Adm1n!str@t0rP@ss^'",
    "Incorporate diverse symbols (e.g., !@#$%^&*) to increase complexity and entropy beyond the current 35.1 bits. Example: 'Admin_123#$%'",
    "Avoid highly predictable patterns like common service names ('Admin') followed by simple sequences ('123'). Example: 'SysOpSecure7*Key'"
  ],
  "reasoning": [
    "Major weakness stems from using a common username ('Admin') combined with a trivial numeric sequence ('123'), a pattern frequently targeted in breach replay and Dictionary Attacks (Smart Guessing: <1 second).",
    "Insufficient length (9 chars) and total lack of symbols (0% composition) contribute to low entropy (35.1 bits) and enable rapid cracking (seconds) via GPU-accelerated Brute-Force attacks."
  ],
  "improvedPassword": "Jm$7pW*qXz!9sN@v"
}
<|eot_id|>

**Example 3 (Remains Largely Same - Focus on Complexity/Length):**
<|start_header_id|>user<|end_header_id|>
**Password Analysis Context (Client-Side Calculation):**
*   **Strength Score (zxcvbn):** 2/4
*   **Entropy:** 48.2 bits
*   **Character Composition (12 total):** Uppercase: 1 (8%), Lowercase: 11 (92%), Numbers: 0 (0%), Symbols: 0 (0%)
*   **Estimated Time to Crack (zxcvbn):** Brute Force (1 day), Smart Guessing (2 hours)
*   **Hardware-Specific Estimates (bcrypt):** CPU (5 mo), Normal GPU (1 day), High-End GPU (3 hrs)
*   **Found in Breached Dataset (Hypothetical):** false

Execute analysis for password: "Sunshineblue"<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
{
  "suggestions": [
    "Include numbers and at least two distinct symbols to significantly increase character complexity and entropy above 48.2 bits. Example: 'Sunsh1n3Blu3!@'",
    "Increase password length to 16+ characters for multi-year resilience against high-end GPU cracking. Example: 'MySunShineBlu3Sky$9'",
    "Break up dictionary words or use less common combinations to improve resistance against hybrid dictionary attacks. Example: 'Sh1n3Blu_Sun7%'"
  ],
  "reasoning": [
    "Primary weakness is the complete lack of numbers and symbols (0% composition), limiting complexity and making the password vulnerable to Hybrid Dictionary attacks despite its 12-character length.",
    "Moderate entropy (48.2 bits) offers limited protection; crack times measured in hours/days on GPUs are within feasible limits for motivated attackers using optimized brute-force techniques."
  ],
  "improvedPassword": "bL@7#zPqV*mK9s!W"
}
<|eot_id|>

**--- End of Few-Shot Examples ---**

<|eot_id|>
<|start_header_id|>user<|end_header_id|>
${contextString} <!-- CONTEXT INJECTED HERE -->

Execute the password security analysis for the password provided below, strictly following the system prompt rules and considering the provided analysis context. Your response must be **only** the raw JSON object as specified. Analyze this password: "${password}"<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
`;
// console.log("--- START Ollama Prompt ---");
//   console.log("Sending the following prompt to Ollama backend:");
  // console.log(prompt); // Log the complete prompt string
  // console.log(contextString);
//   console.log("--- END Ollama Prompt ---");

  try {
    const response = await fetch(OLLAMA_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any other headers your backend might require (e.g., API key if you add auth later)
      },
      // Construct the body matching the FastAPI backend's OllamaApiRequest model
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        // Include generationConfig if your backend uses it, otherwise it can be omitted
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 5120, // Adjust as needed
          responseMimeType: "application/json" // Backend expects this implicitly now
        }
      })
    });

    if (!response.ok) {
      // Attempt to read error details from the backend response
      let errorDetail = `Ollama backend request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail; // Use detail field from FastAPI HTTPException if available
        console.error(`Ollama backend error (${response.status}):`, errorData);
      } catch (e) {
        // If reading JSON fails, use the status text
        errorDetail = `${errorDetail} ${response.statusText}`;
        console.error(`Ollama backend request failed (${response.status}): ${response.statusText}`);
      }
      // Update error message if backend indicates service unavailability
      if (errorDetail.includes("service is not available")) {
        errorDetail = "Ollama service is not available. Please ensure Ollama is running and accessible.";
      }
      // Fallback structure for UI stability
      return {
        suggestions: ["Error: AI analysis unavailable.", errorDetail],
        reasoning: ["Could not get analysis from the backend service."],
        improvedPassword: password // Return original password on error
      };
    }

    // If response is OK, parse the JSON body
    const data: AiAnalysisResult = await response.json();

    // Basic validation (optional, but good practice)
    if (!data || !Array.isArray(data.suggestions) || !Array.isArray(data.reasoning) || typeof data.improvedPassword !== 'string') {
      console.error("Invalid data structure received from Ollama backend:", data);
      return {
        suggestions: ["Error: Invalid response format from AI."],
        reasoning: ["The backend returned unexpected analysis data structure."],
        improvedPassword: password
      };
    }

    // console.log("Received analysis from Ollama backend.");
    return data; // Return the parsed data

  } catch (error) {
    console.error("Error during Ollama backend communication:", error);
    // Network errors (e.g., backend down) or other fetch issues land here
    let errorMessage = "Could not connect to the analysis service.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      suggestions: ["Error: AI analysis failed.", errorMessage],
      reasoning: ["Could not communicate with the backend analysis service."],
      improvedPassword: password // Return original password on error
    };
  }
}
