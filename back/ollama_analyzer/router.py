#!/usr/bin/env python3
"""
API Router for Ollama Password Analysis Service.

Handles requests to analyze passwords using a configured Ollama model,
manages the connection to the Ollama service, and defines endpoints
for analysis, health checks, and service info.
"""

import logging
import json
import sys
from typing import Optional, Dict, Any # Use modern type hinting

from fastapi import APIRouter, HTTPException, status, Body # Import Body for request body description
import httpx # For catching specific HTTP client exceptions

# --- Ollama Library Import ---
try:
    from ollama import AsyncClient, ResponseError
    # from ollama._types import ChatResponse, Message # Optional: Import specific types if needed for stricter checks
    print("Successfully imported AsyncClient, ResponseError from 'ollama' library.")
except ImportError as e:
    print("\n--- FATAL ERROR: 'ollama' library not found ---")
    print(f"Error message: {e}")
    print("Please install it: pip install ollama")
    print("----------------------------------------------------\n")
    sys.exit(1)
except Exception as e:
    print(f"\n--- UNEXPECTED ERROR during 'ollama' library import: {e} ---")
    sys.exit(1)

# --- Local Imports ---
try:
    # Ensure Content and Part are imported for type checking during prompt extraction
    from .models import OllamaApiRequest, AnalysisResponse, Content, Part
    from .. import config
except ImportError as e:
    print(f"\n--- ERROR: Failed local imports in ollama_analyzer/router.py: {e} ---")
    print("Ensure file structure and package execution (e.g., uvicorn back.main:app) are correct.")
    sys.exit(1)


# --- Logger Setup ---
logger = logging.getLogger("ollama_analyzer")

# --- Module Global State ---
ollama_async_client: Optional[AsyncClient] = None
ollama_initialized: bool = False
ollama_init_error: Optional[str] = None
# Retrieve timeout from config, provide a sensible default
ollama_client_timeout: float = getattr(config, 'OLLAMA_TIMEOUT', 300.0)

# --- Router Definition ---
router = APIRouter()

# --- Lifespan Events (Startup and Shutdown) ---
@router.on_event("startup")
async def startup_ollama_client():
    """Initializes the Ollama AsyncClient during application startup."""
    global ollama_async_client, ollama_initialized, ollama_init_error, ollama_client_timeout
    if ollama_initialized:
        logger.info("Ollama client already initialized.")
        return

    logger.info("Ollama Analyzer Router: Initializing AsyncClient...")
    try:
        logger.info(f"Connecting to Ollama: host={config.OLLAMA_HOST}, timeout={ollama_client_timeout}s")
        ollama_async_client = AsyncClient(host=config.OLLAMA_HOST, timeout=ollama_client_timeout)
        await ollama_async_client.list() # Perform a quick check to verify connectivity
        logger.info(f"Ollama AsyncClient initialized successfully. Host '{config.OLLAMA_HOST}' reachable.")
        ollama_initialized = True
        ollama_init_error = None
    # Specific error handling for common initialization issues
    except httpx.ConnectError as e:
        error_msg = f"Connection Error: Cannot connect to Ollama at {config.OLLAMA_HOST}. Is 'ollama serve' running? Error: {e}"
        logger.error(error_msg)
        ollama_init_error = error_msg
    except httpx.Timeout as e:
        error_msg = f"Timeout Error: Connection to Ollama ({config.OLLAMA_HOST}) timed out after {ollama_client_timeout}s. Error: {e}"
        logger.error(error_msg)
        ollama_init_error = error_msg
    except ResponseError as e:
        error_msg = f"Ollama API Error during init: Status {e.status_code} - {e.error}. Host: {config.OLLAMA_HOST}"
        logger.error(error_msg)
        ollama_init_error = error_msg
    except Exception as e: # Catch any other unexpected errors
        error_msg = f"Unexpected error during Ollama client init: {type(e).__name__} - {e}"
        logger.exception(error_msg) # Log full traceback
        ollama_init_error = error_msg
    finally: # Ensure state reflects the outcome
        if ollama_init_error:
            ollama_async_client = None
            ollama_initialized = False
            logger.error("Ollama client initialization FAILED.")
        else:
            logger.info("Ollama client initialization SUCCEEDED.")


@router.on_event("shutdown")
async def shutdown_ollama_client():
    """Cleans up Ollama client resources during application shutdown."""
    global ollama_async_client, ollama_initialized, ollama_init_error
    logger.info("Ollama Analyzer Router: Shutting down...")
    # Clear global references; AsyncClient doesn't require explicit close
    ollama_async_client = None
    ollama_initialized = False
    ollama_init_error = None
    logger.info("Ollama AsyncClient reference cleared.")

# --- API Endpoints ---

@router.post(
    "/generateContent",
    response_model=AnalysisResponse,
    summary="Analyze Password Strength with Ollama",
    description="Sends a password prompt to Ollama, parses the JSON response, and returns structured analysis.",
    response_description="JSON object with password analysis results.",
    status_code=status.HTTP_200_OK,
    tags=["Ollama Analyzer"],
    responses={ # Define possible error responses for documentation
        status.HTTP_400_BAD_REQUEST: {"description": "Invalid request format"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Internal backend error"},
        status.HTTP_502_BAD_GATEWAY: {"description": "Error with Ollama service/response"},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "Ollama service unavailable"},
        status.HTTP_504_GATEWAY_TIMEOUT: {"description": "Ollama request timed out"},
    }
)
async def generate_ollama_content(
    request: OllamaApiRequest = Body(..., description="Request body with prompt for Ollama.")
):
    """Endpoint to process password analysis requests via Ollama."""
    global ollama_client_timeout # Access timeout if needed for messages

    # --- Pre-check: Ensure Client is Initialized ---
    if not ollama_initialized or ollama_async_client is None:
        logger.warning("Ollama /generateContent called, but client not initialized.")
        detail_msg = "Ollama analysis service unavailable (initialization failure)."
        if ollama_init_error: detail_msg += f" Reason: {ollama_init_error}"
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail_msg)

    logger.info(f"Processing Ollama analysis request using model: {config.OLLAMA_MODEL}")

    # --- Extract Prompt from Request Body ---
    try: # Use imported Pydantic models (Content, Part) for robust extraction and type checking
        if not request.contents:
            raise ValueError("Request 'contents' list is missing or empty.")
        content_item = request.contents[0] # Assume first content item is primary
        if not isinstance(content_item, Content) or not content_item.parts:
            raise ValueError("Request 'parts' list is missing or empty in the first content item.")
        part_item = content_item.parts[0] # Assume first part has the text
        if not isinstance(part_item, Part) or not isinstance(part_item.text, str):
            raise ValueError("Request 'text' field is missing or not a string in the first part.")

        prompt = part_item.text
        if not prompt.strip(): # Ensure prompt is not just whitespace
            raise ValueError("Extracted prompt text is empty.")

        logger.debug(f"Extracted prompt (first 100 chars): '{prompt[:100]}...'")

    except (AttributeError, IndexError, ValueError, TypeError) as e:
         # Log validation/extraction errors and return 400
         logger.error(f"Failed to extract prompt from invalid request format: {e}. Request dump: {request.model_dump()}", exc_info=True)
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail=f"Invalid request format. Could not extract prompt text. Error: {e}"
         )
    except Exception as e: # Catch any other unexpected errors during extraction
        logger.error(f"Unexpected error extracting prompt: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing request body: {type(e).__name__}"
        )

    # --- Call Ollama Service ---
    ollama_raw_content: Optional[str] = None # To store the raw response content for logging
    try:
        logger.info(f"Sending prompt to Ollama model '{config.OLLAMA_MODEL}'...")
        context_window_size = 4096 # Example context window, adjust based on model/needs
        logger.debug(f"Setting context window size (num_ctx) for Ollama call: {context_window_size}")

        # Make the actual API call to Ollama
        response = await ollama_async_client.chat(
            model=config.OLLAMA_MODEL,
            messages=[{'role': 'user', 'content': prompt}],
            format="json", # Request JSON output
            options={'num_ctx': context_window_size} # Pass options like context window
        )

        # Log response details for debugging
        # Handle potential differences in response type (dict vs object) for stats
        duration_ns = response.get('total_duration') if isinstance(response, dict) else getattr(response, 'total_duration', None)
        duration_s = duration_ns / 1e9 if duration_ns else 'N/A'
        eval_count = response.get('eval_count') if isinstance(response, dict) else getattr(response, 'eval_count', 'N/A')
        logger.info(f"Received response from Ollama. Duration: {duration_s}s, Eval Count: {eval_count}")
        logger.debug(f"Full Ollama response object (type: {type(response)}): {response}")

        # --- Process Ollama Response ---
        # Check response structure using attribute access (based on observed ollama._types.ChatResponse)
        # Use hasattr for safety before accessing attributes.
        if not response or \
           not hasattr(response, 'message') or \
           not response.message or \
           not hasattr(response.message, 'content'):
            # Log detailed error if structure is unexpected
            logger.error(f"Invalid response structure from Ollama. Expected object with .message.content attribute. "
                         f"Response type: {type(response)}. Response object: {response}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Received invalid/incomplete response structure from Ollama (missing message/content attributes)."
            )

        # Access the content string using attribute access
        ollama_raw_content = response.message.content

        # Verify the content is actually a string
        if not isinstance(ollama_raw_content, str):
            logger.error(f"Invalid content type from Ollama: response.message.content is not a string. Type: {type(ollama_raw_content)}. Value: {ollama_raw_content}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Ollama service returned unexpected content type in message (expected JSON string)."
            )

        logger.debug(f"Raw Ollama JSON content string received (first 500 chars): {ollama_raw_content[:500]}...")

        # --- Parse, Post-Process, and Validate the JSON Content ---
        try:
            # Parse the JSON string from the content
            parsed_data: Dict[str, Any] = json.loads(ollama_raw_content)

            # Ensure the parsed result is a dictionary
            if not isinstance(parsed_data, dict):
                 logger.error(f"Parsed Ollama content is not a JSON object (dict). Type: {type(parsed_data)}. Content: {ollama_raw_content[:500]}")
                 raise TypeError(f"Parsed JSON is not a dictionary (got {type(parsed_data).__name__}).")

            # --- START POST-PROCESSING & CLEANUP ---
            # Apply robust cleaning to handle variations in LLM output format
            # Reasoning: Ensure list of strings, max 2 items
            raw_reasoning = parsed_data.get("reasoning"); cleaned_reasoning = []
            if isinstance(raw_reasoning, list): cleaned_reasoning = [str(item).strip() for item in raw_reasoning if isinstance(item, str) and str(item).strip()][:2]
            elif isinstance(raw_reasoning, str): cleaned_reasoning = [raw_reasoning.strip()] if raw_reasoning.strip() else []
            if not cleaned_reasoning: logger.warning(f"Ollama 'reasoning' field invalid/missing ({type(raw_reasoning)}). Defaulting."); cleaned_reasoning = ["Analysis details not provided."]
            parsed_data["reasoning"] = cleaned_reasoning

            # Suggestions: Ensure list of strings
            raw_suggestions = parsed_data.get("suggestions"); cleaned_suggestions = []
            if isinstance(raw_suggestions, list): cleaned_suggestions = [str(item).strip() for item in raw_suggestions if isinstance(item, str) and str(item).strip()]
            elif isinstance(raw_suggestions, str): cleaned_suggestions = [raw_suggestions.strip()] if raw_suggestions.strip() else []
            if not cleaned_suggestions: logger.warning(f"Ollama 'suggestions' field invalid/missing ({type(raw_suggestions)}). Defaulting."); cleaned_suggestions = ["No specific suggestions provided."]
            parsed_data["suggestions"] = cleaned_suggestions

            # Improved Password: Ensure string or None
            raw_improved_pw = parsed_data.get("improvedPassword"); cleaned_improved_pw = None
            if isinstance(raw_improved_pw, str) and raw_improved_pw.strip(): cleaned_improved_pw = raw_improved_pw.strip()
            else: logger.warning(f"Ollama 'improvedPassword' invalid/missing ({type(raw_improved_pw)}). Setting None.")
            parsed_data["improvedPassword"] = cleaned_improved_pw
            # --- END POST-PROCESSING ---

            # Validate the cleaned data against the Pydantic response model
            validated_response = AnalysisResponse(**parsed_data)
            logger.info("Successfully parsed, cleaned, and validated Ollama JSON response.")
            return validated_response # Return the validated data

        # Handle errors during JSON parsing, post-processing, or Pydantic validation
        except json.JSONDecodeError as json_err:
            logger.error(f"Failed to parse JSON response from Ollama '{config.OLLAMA_MODEL}': {json_err}")
            logger.error(f"Ollama raw content (parsing error): {ollama_raw_content[:500]}")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to parse JSON from Ollama. Error: {json_err}. Snippet: {ollama_raw_content[:100]}...")
        except (TypeError, ValueError, KeyError) as process_err: # Catches errors in cleaning/processing logic
             logger.error(f"Error processing parsed/cleaned JSON data before validation: {process_err}", exc_info=True)
             logger.error(f"Data causing processing error: {parsed_data if 'parsed_data' in locals() else 'N/A'}")
             raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Error processing Ollama response content: {process_err}")
        except Exception as validation_err: # Catches Pydantic's ValidationError
             logger.error(f"Failed validating cleaned JSON against AnalysisResponse: {validation_err}", exc_info=True)
             logger.error(f"Cleaned data failing validation: {parsed_data}")
             logger.error(f"Original raw Ollama content: {ollama_raw_content[:500]}...")
             raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Ollama response structure mismatch. Validation Error: {validation_err}")

    # --- Handle Specific Ollama/HTTPX Errors during the API call ---
    except ResponseError as e: # Errors reported by the Ollama API itself
        logger.error(f"Ollama API Error during chat: {e.error} (Status: {e.status_code})", exc_info=True)
        # Map Ollama status codes to HTTP status codes
        http_status_map = { 400: status.HTTP_400_BAD_REQUEST, 404: status.HTTP_404_NOT_FOUND, 401: status.HTTP_401_UNAUTHORIZED, 429: status.HTTP_429_TOO_MANY_REQUESTS, 500: status.HTTP_500_INTERNAL_SERVER_ERROR, 503: status.HTTP_503_SERVICE_UNAVAILABLE, }
        http_status = http_status_map.get(e.status_code, status.HTTP_502_BAD_GATEWAY) # Default to 502
        detail = f"Ollama service error: {e.error}"
        if http_status == 404: detail = f"Ollama model '{config.OLLAMA_MODEL}' not found at '{config.OLLAMA_HOST}'."
        elif "connection refused" in str(e.error).lower(): http_status, detail = 503, f"Connection to Ollama ({config.OLLAMA_HOST}) refused. Is 'ollama serve' running?"
        raise HTTPException(status_code=http_status, detail=detail)
    except httpx.ReadTimeout as e: # Request to Ollama timed out
        logger.error(f"Ollama request timed out ({ollama_client_timeout}s).", exc_info=False)
        detail_msg = f"Ollama timed out after {ollama_client_timeout}s. Increase OLLAMA_TIMEOUT or check service load."
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=detail_msg)
    except httpx.RemoteProtocolError as e: # Connection closed unexpectedly
        logger.error(f"Connection to Ollama failed unexpectedly: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Connection to Ollama lost unexpectedly.")
    except httpx.ConnectError as e: # Failed to connect to Ollama host/port
        logger.error(f"Could not connect to Ollama ({config.OLLAMA_HOST}): {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Could not connect to Ollama at {config.OLLAMA_HOST}.")
    except HTTPException:
        # Re-raise HTTPExceptions that were raised internally (e.g., 400, 502 from processing)
        # Prevents them from being caught by the generic Exception handler below.
        raise
    except Exception as e: # Catch-all for any other truly unexpected errors
        logger.exception(f"Unexpected error during Ollama analysis: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal backend error occurred: {type(e).__name__}"
        )


# --- Health Check Endpoint ---
@router.get(
    "/health",
    summary="Ollama Service Health Check",
    description="Checks Ollama service initialization and performs a live connectivity test.",
    response_description="JSON indicating health status ('ok' or 'unhealthy').",
    tags=["Ollama Analyzer"],
    responses={
        status.HTTP_200_OK: {"description": "Service initialized and reachable."},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "Service not initialized or unreachable.", "model": Dict[str, str]},
    }
)
async def health_check_ollama():
    """Checks Ollama service initialization and live connectivity."""
    logger.debug("Performing Ollama health check...")

    # Check if client was initialized successfully during startup
    if not ollama_initialized or ollama_async_client is None:
        logger.warning(f"Health Check Fail: Not initialized. Reason: {ollama_init_error}")
        # Return 503 status code with details in the body for health check failure
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "unhealthy", "reason": ollama_init_error or "Init failed."}
        )

    # If initialized, perform a live check to ensure Ollama is still responsive
    try:
        await ollama_async_client.list() # Use a lightweight API call
        logger.info("Health Check OK: Initialized and host responding.")
        return {"status": "ok", "message": f"Ollama client initialized, host '{config.OLLAMA_HOST}' responding."}
    except (ResponseError, httpx.HTTPStatusError, httpx.RequestError) as e: # Catch common API/network errors
        error_type = type(e).__name__; error_detail = str(e)
        if isinstance(e, ResponseError): error_detail = f"API Error {e.status_code}: {e.error}"
        logger.warning(f"Health Check Fail: Live check failed ({error_type}): {error_detail}", exc_info=False)
        # Return 503 status code with details for live check failure
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "unhealthy", "reason": f"Live check failed: {error_type} - {error_detail}"}
        )
    except Exception as e: # Catch unexpected errors during the live check
        logger.exception("Health Check Fail: Unexpected error during live check.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "unhealthy", "reason": f"Unexpected live check error: {type(e).__name__}"}
        )


# --- Root Endpoint for this Router ---
@router.get(
    "/",
    summary="Ollama Analyzer Service Root",
    description="Provides basic information about the Ollama password analyzer service configuration and status.",
    response_description="JSON object with service details.",
    tags=["Ollama Analyzer"]
)
async def read_ollama_root():
    """Provides basic info about the Ollama analyzer service."""
    logger.debug("Ollama root endpoint '/' accessed")
    status_detail = "initialized_ready"
    if not ollama_initialized:
        status_detail = f"init_failed (Error: {ollama_init_error})" if ollama_init_error else "not_initialized"

    # Return key configuration and status information
    return {
        "service_name": "Ollama Password Analyzer",
        "description": "Analyzes passwords via local Ollama LLM.",
        "config": {
            "model": config.OLLAMA_MODEL,
            "host": config.OLLAMA_HOST,
            "timeout_s": ollama_client_timeout
        },
        "client_status": status_detail,
    }