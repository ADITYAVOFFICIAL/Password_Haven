# /Users/adityaverma/Documents/GitHub/Password_Haven/main.py
import os
import json
import logging
import sys
import uvicorn

# --- Explicit Imports from the ollama library ---
try:
    # Import specific classes/functions directly
    from ollama import Client, AsyncClient, ResponseError, list as ollama_list
    print("Successfully imported Client, AsyncClient, ResponseError from 'ollama' library.")
except ImportError as e:
    print("--- FATAL: Failed to import required components from the 'ollama' library ---")
    print(f"Error: {e}")
    print("Please ensure the 'ollama' library is installed correctly in your virtual environment (.venv).")
    print("Run: pip install ollama")
    print("----------------------------------------------------")
    sys.exit(1) # Exit if library components can't be imported
except Exception as e:
    print(f"--- UNEXPECTED ERROR during specific ollama imports: {e} ---")
    sys.exit(1)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Configuration ---
OLLAMA_MODEL = "llama3.1:8b"
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("password_api") # Changed logger name slightly

# --- Pydantic Models ---
# (Keep Pydantic models as they were)
class Part(BaseModel):
    text: str
class Content(BaseModel):
    parts: List[Part]
class GenerationConfig(BaseModel):
    temperature: Optional[float] = None
    top_k: Optional[int] = Field(None, alias='topK')
    top_p: Optional[float] = Field(None, alias='topP')
    max_output_tokens: Optional[int] = Field(None, alias='maxOutputTokens')
    response_mime_type: Optional[str] = Field(None, alias='responseMimeType')
class OllamaApiRequest(BaseModel):
    contents: List[Content]
    generation_config: Optional[GenerationConfig] = Field(None, alias='generationConfig')
class AnalysisResponse(BaseModel):
    suggestions: List[str]
    reasoning: List[str]
    improvedPassword: str

# --- FastAPI Application ---
app = FastAPI(
    title="Password Analysis API",
    description="Provides password analysis using Ollama.",
    version="1.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Ollama Async Client Initialization ---
# Simpler initialization: Try creating AsyncClient directly.
# The check using the sync Client seemed problematic in this setup.
ollama_async_client = None # Use a distinct variable name
try:
    logger.info(f"Attempting to initialize Ollama AsyncClient for host {OLLAMA_HOST}...")
    # Use the imported AsyncClient directly
    ollama_async_client = AsyncClient(host=OLLAMA_HOST)
    # Optional: Perform a quick async check if needed, but often initializing is enough proof
    # For example, you could try a quick `await ollama_async_client.list()` here within an async context
    # but that complicates startup logic. Let's rely on the first API call to fail if connection is bad.
    logger.info(f"Ollama AsyncClient initialized successfully for host {OLLAMA_HOST}.")

except Exception as e:
    logger.error(f"--- Ollama AsyncClient Initialization Failed ---")
    logger.error(f"Failed to initialize Ollama AsyncClient for host: {OLLAMA_HOST}")
    logger.error(f"Error type: {type(e).__name__}, Error details: {e}")
    logger.error(f"Please ensure the 'ollama serve' command is running and accessible at {OLLAMA_HOST}.")
    logger.error(f"The API endpoint '/generateContent' will return a 503 Service Unavailable error.")
    logger.error(f"---------------------------------------------")
    ollama_async_client = None # Ensure it's None on error


# --- API Endpoint for Ollama Analysis ---
@app.post("/generateContent", response_model=AnalysisResponse)
async def generate_ollama_content(request: OllamaApiRequest):
    # Check if the async client was initialized
    if ollama_async_client is None:
         logger.warning("Received request to /generateContent, but Ollama AsyncClient is not available (failed during startup).")
         raise HTTPException(
            status_code=503, # Service Unavailable
            detail=f"Ollama service client not initialized. Backend failed to initialize connection to Ollama at {OLLAMA_HOST}. Check backend logs."
        )

    logger.info(f"Received request for Ollama model: {OLLAMA_MODEL}")

    # --- Extract the Prompt ---
    try:
        if not request.contents or not request.contents[0].parts:
            raise HTTPException(status_code=400, detail="Invalid request format: Missing contents or parts.")
        prompt = request.contents[0].parts[0].text
        logger.info(f"Extracted Prompt (first 100 chars): {prompt[:100]}...")
    except Exception as e:
        logger.error(f"Error extracting prompt: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Error processing request body: {e}")

    # --- Call Ollama using the initialized async client ---
    try:
        logger.info(f"Sending prompt to Ollama model '{OLLAMA_MODEL}' via async client...")
        # Use the imported AsyncClient instance
        response = await ollama_async_client.chat(
            model=OLLAMA_MODEL,
            messages=[{'role': 'user', 'content': prompt}],
            format="json" # Request JSON format
        )
        logger.info(f"Received response from Ollama model '{OLLAMA_MODEL}'.")

        # --- Process Ollama Response ---
        if 'message' not in response or 'content' not in response['message']:
             logger.error(f"Invalid response structure from Ollama: Missing 'message' or 'content'. Response: {response}")
             raise HTTPException(status_code=500, detail="Invalid response structure received from Ollama.")

        ollama_content = response['message']['content']
        logger.debug(f"Raw Ollama content: {ollama_content}")

        # --- Parse JSON from Ollama Response ---
        try:
            parsed_data = json.loads(ollama_content)
            validated_response = AnalysisResponse(**parsed_data)
            logger.info("Successfully parsed and validated Ollama JSON response.")
            return validated_response
        except json.JSONDecodeError as json_err:
            logger.error(f"Failed to parse JSON from Ollama response: {json_err}")
            logger.error(f"Ollama raw content was: {ollama_content}")
            raise HTTPException(
                status_code=502,
                detail=f"Failed to parse JSON from Ollama model '{OLLAMA_MODEL}'. Raw content: {ollama_content[:200]}..."
            )
        except Exception as pydantic_err: # Catch Pydantic validation errors
             logger.error(f"Failed to validate parsed JSON against response model: {pydantic_err}")
             logger.error(f"Parsed data was: {parsed_data}")
             raise HTTPException(
                status_code=502,
                detail=f"Ollama response structure mismatch after parsing. Details: {pydantic_err}"
             )

    # Use the imported ResponseError directly
    except ResponseError as e:
        logger.error(f"Ollama API Error occurred: {e.error} (Status code: {e.status_code})", exc_info=True)
        status_code = 502 # Bad Gateway as default
        error_detail = f"Error communicating with Ollama: {e.error}"
        if e.status_code == 404:
            status_code = 404
            error_detail = f"Ollama model '{OLLAMA_MODEL}' not found at {OLLAMA_HOST}. Ensure it's pulled ('ollama pull {OLLAMA_MODEL}')."
        elif e.status_code == 503:
             status_code = 503
             error_detail = f"Ollama service reported unavailable. Status: {e.status_code}, Error: {e.error}"
        raise HTTPException(status_code=status_code, detail=error_detail)

    except Exception as e:
        logger.exception("An unexpected error occurred during Ollama analysis.") # Logs full traceback
        raise HTTPException(status_code=500, detail=f"An internal server error occurred in the backend: {e}")


# --- Root Endpoint (Optional) ---
@app.get("/")
async def read_root():
    ollama_status = "client initialized" if ollama_async_client else f"client NOT initialized (check startup logs for connection status to {OLLAMA_HOST})"
    return {
        "message": f"Password Analysis API using Ollama ({OLLAMA_MODEL}) is running.",
        "ollama_service_status": ollama_status
    }

# --- Run the Server ---
# This block is mainly for informational purposes if run directly.
if __name__ == "__main__":
    print("\n--- Running main.py directly ---")
    print("Recommendation: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`")
    print("Attempting to start Uvicorn programmatically...")
    print("------------------------------------------\n")

    if ollama_async_client is None:
        print("--- Uvicorn Startup Warning (Programmatic) ---")
        print(f"Ollama AsyncClient was not initialized during script load. Check logs above.")
        print("AI features via /generateContent will likely fail (503 Error).")
        print("----------------------------------------------\n")
    else:
         print("--- Uvicorn Startup (Programmatic) ---")
         print(f"Ollama AsyncClient initialized successfully during script load.")
         print("--------------------------------------\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)