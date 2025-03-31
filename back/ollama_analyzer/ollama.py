# /your_project_root/back/ollama_analyzer/router.py
import logging
import json
import sys
from typing import Union, Optional
from fastapi import APIRouter, HTTPException, status

# --- Ollama Library Import ---
try:
    from ollama import Client, AsyncClient, ResponseError
    print("Successfully imported Client, AsyncClient, ResponseError from 'ollama' library.")
except ImportError as e:
    print("--- FATAL: Failed to import 'ollama' library in ollama_analyzer/router.py ---")
    print(f"Error: {e}")
    print("Ensure 'ollama' is installed in the project's .venv: pip install ollama")
    print("----------------------------------------------------")
    sys.exit(1)
except Exception as e:
    print(f"--- UNEXPECTED ERROR during ollama import: {e} ---")
    sys.exit(1)

# --- Local Imports ---
# Use relative imports within the 'back' package
from .models import OllamaApiRequest, AnalysisResponse # Import models from sibling file
from .. import config # Import central configuration

logger = logging.getLogger("ollama_analyzer") # Specific logger

# --- Global State for this module ---
# Use Union[] for Python < 3.10 compatibility
ollama_async_client: Optional[AsyncClient] = None
ollama_initialized = False
ollama_init_error = None

# --- Router Definition ---
# This router will be included by the main app with a prefix like '/ollama'
router = APIRouter()

# --- Startup and Shutdown Events for the Router ---
@router.on_event("startup")
async def startup_ollama_client():
    global ollama_async_client, ollama_initialized, ollama_init_error
    logger.info("Ollama Analyzer Router: Initializing AsyncClient...")
    try:
        logger.info(f"Attempting connection to Ollama at {config.OLLAMA_HOST}...")
        ollama_async_client = AsyncClient(host=config.OLLAMA_HOST)
        # Perform a quick check to ensure the host is reachable and model *might* exist
        # Listing models is a relatively lightweight check
        await ollama_async_client.list()
        logger.info(f"Ollama AsyncClient initialized and host {config.OLLAMA_HOST} reachable.")
        ollama_initialized = True
        ollama_init_error = None
    except Exception as e:
        error_msg = f"Failed to initialize/connect Ollama AsyncClient at {config.OLLAMA_HOST}: {e}"
        logger.error(error_msg)
        logger.error("Ensure 'ollama serve' is running and accessible.")
        ollama_init_error = error_msg
        ollama_async_client = None
        ollama_initialized = False

@router.on_event("shutdown")
async def shutdown_ollama_client():
    global ollama_async_client, ollama_initialized
    logger.info("Ollama Analyzer Router: Shutting down...")
    # AsyncClient doesn't have an explicit close method in the typical sense
    ollama_async_client = None
    ollama_initialized = False
    logger.info("Ollama AsyncClient reference cleared.")

# --- API Endpoints relative to the router prefix ---
@router.post("/generateContent", response_model=AnalysisResponse, tags=["Ollama Analyzer"])
async def generate_ollama_content(request: OllamaApiRequest):
    """Analyzes password strength using the configured Ollama model."""
    if not ollama_initialized or ollama_async_client is None:
        logger.warning("Ollama /generateContent called but client not initialized.")
        detail_msg = "Ollama analysis service is not available."
        if ollama_init_error:
            detail_msg += f" Reason: {ollama_init_error}"
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail_msg)

    logger.info(f"Received request for Ollama model: {config.OLLAMA_MODEL}")
    try:
        if not request.contents or not request.contents[0].parts:
            raise HTTPException(status_code=400, detail="Invalid request: Missing contents or parts.")
        prompt = request.contents[0].parts[0].text
        logger.info(f"Extracted Prompt (first 100 chars): {prompt[:100]}...")
    except Exception as e:
        logger.error(f"Error extracting prompt: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Error processing request body: {e}")

    try:
        logger.info(f"Sending prompt to Ollama model '{config.OLLAMA_MODEL}'...")
        response = await ollama_async_client.chat(
            model=config.OLLAMA_MODEL,
            messages=[{'role': 'user', 'content': prompt}],
            format="json" # Request JSON format
        )
        logger.info(f"Received response from Ollama model '{config.OLLAMA_MODEL}'.")

        if 'message' not in response or 'content' not in response['message']:
             logger.error(f"Invalid response structure from Ollama. Response: {response}")
             raise HTTPException(status_code=502, detail="Invalid response structure from Ollama.")

        ollama_content = response['message']['content']
        logger.debug(f"Raw Ollama content: {ollama_content}")

        try:
            parsed_data = json.loads(ollama_content)
            validated_response = AnalysisResponse(**parsed_data)
            logger.info("Successfully parsed and validated Ollama JSON response.")
            return validated_response
        except json.JSONDecodeError as json_err:
            logger.error(f"Failed to parse JSON from Ollama: {json_err}. Content: {ollama_content[:200]}...")
            raise HTTPException(status_code=502, detail=f"Failed to parse JSON from Ollama model '{config.OLLAMA_MODEL}'.")
        except Exception as pydantic_err: # Catch Pydantic validation errors
             logger.error(f"Failed to validate parsed JSON: {pydantic_err}. Parsed data: {parsed_data}")
             raise HTTPException(status_code=502, detail=f"Ollama response structure mismatch: {pydantic_err}")

    except ResponseError as e:
        logger.error(f"Ollama API Error: {e.error} (Status: {e.status_code})", exc_info=True)
        status_code_map = {404: 404, 503: 503}
        http_status = status_code_map.get(e.status_code, 502) # Default to 502 Bad Gateway
        detail = f"Error from Ollama service: {e.error}"
        if http_status == 404:
            detail = f"Ollama model '{config.OLLAMA_MODEL}' not found at {config.OLLAMA_HOST}."
        raise HTTPException(status_code=http_status, detail=detail)
    except Exception as e:
        logger.exception("Unexpected error during Ollama analysis.")
        raise HTTPException(status_code=500, detail=f"Internal backend error during Ollama analysis: {e}")

@router.get("/health", tags=["Ollama Analyzer"])
async def health_check_ollama():
    """Checks the initialization status of the Ollama client."""
    if ollama_initialized and ollama_async_client is not None:
         # Could add a quick ping/list models here for a deeper check if desired
         return {"status": "ok", "message": "Ollama client is initialized."}
    else:
        return {"status": "unhealthy", "reason": ollama_init_error or "Ollama client not initialized."}

@router.get("/", tags=["Ollama Analyzer"])
async def read_ollama_root():
    """Root endpoint for the Ollama analyzer section."""
    return {"message": f"Ollama Password Analyzer using model '{config.OLLAMA_MODEL}'"}