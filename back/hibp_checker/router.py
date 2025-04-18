#!/usr/bin/env python3
"""
API Router for the Offline HIBP (Have I Been Pwned) Password Checker Service.

Uses the 'pwnedpasswords-offline' library to check passwords against a local
copy of the HIBP database. Supports acceleration via Bloom filters if present.
Defines endpoints for checking passwords, health status, and service info.
"""

import os
import logging
from typing import Optional # Union no longer needed for Optional in modern Python

from fastapi import APIRouter, HTTPException, Query, status

# --- Library Import ---
# Attempt to import the required library for offline HIBP checks.
try:
    from pwnedpasswords_offline import PwnedPasswordsOfflineChecker
    print("Successfully imported PwnedPasswordsOfflineChecker from 'pwnedpasswords_offline'.")
except ImportError:
    # Fatal error if the library isn't installed. Provide clear instructions.
    print("\n--- FATAL ERROR: 'pwnedpasswords-offline' library not found ---")
    print("The HIBP Checker service requires the 'pwnedpasswords-offline' Python library.")
    print("Please install it in your virtual environment using:")
    print("  pip install pwnedpasswords-offline")
    print("-----------------------------------------------------------------\n")
    raise # Re-raise the ImportError to prevent the application from starting incorrectly

# --- Local Imports ---
# Use relative import for the central configuration module.
try:
    from .. import config
except ImportError:
    print("\n--- ERROR: Failed local import in hibp_checker/router.py ---")
    print("Could not import 'config' using relative path '..'.")
    print("Ensure the application is run as a package (e.g., uvicorn back.main:app).")
    raise # Re-raise to prevent starting with incorrect config


# --- Logger Setup ---
# Create a logger specifically for this HIBP checker module.
logger = logging.getLogger("hibp_checker")

# --- Module Global State ---
# Holds the instance of the HIBP checker library.
checker_instance: Optional[PwnedPasswordsOfflineChecker] = None
# Flag indicating if the checker was successfully initialized on startup.
checker_initialized: bool = False
# Stores any error message encountered during initialization.
checker_init_error: Optional[str] = None
# Flag indicating if a Bloom filter was found at the location expected by the library.
# The library uses it automatically if found; this flag is for reporting/health checks.
bloom_filter_likely_active: bool = False

# --- Router Definition ---
# Create an APIRouter instance. This will be included by the main FastAPI app.
router = APIRouter()

# --- Lifespan Events (Startup and Shutdown) ---
@router.on_event("startup")
async def startup_hibp_checker():
    """
    Initializes the HIBP checker during application startup.
    - Checks for the required HIBP data file (.txt).
    - Checks for the optional Bloom filter file (.bloom) in the same directory.
    - Initializes the PwnedPasswordsOfflineChecker instance.
    - Opens the memory-mapped file for efficient lookups.
    """
    global checker_instance, checker_initialized, checker_init_error, bloom_filter_likely_active
    if checker_initialized: # Avoid re-initialization
        logger.info("HIBP checker already initialized.")
        return

    logger.info("HIBP Checker Router: Initializing...")

    # Get paths from config
    data_path = config.HIBP_DATA_PATH
    bloom_path_configured = config.BLOOM_FILTER_PATH # Path explicitly configured/checked

    # The library implicitly looks for the bloom filter based on the data_path.
    # Construct the path the library expects for logging/comparison purposes.
    expected_bloom_path_for_lib = os.path.splitext(data_path)[0] + ".bloom"

    logger.info(f"Required HIBP Data (.txt) path for init: {data_path}")
    logger.info(f"Library will implicitly look for Bloom filter at: {expected_bloom_path_for_lib}")
    logger.info(f"Path configured for Bloom filter existence check: {bloom_path_configured}")

    # --- Pre-check 1: Data file (.txt) MUST exist ---
    # The library's __init__ requires this path, and usually the file itself.
    if not os.path.exists(data_path):
        error_msg = (f"Initialization failed: Required HIBP data file (.txt) not found at the configured path: '{data_path}'. "
                     "Download the 'pwned-passwords-sha1-ordered-by-hash-vX.txt' file and place it correctly.")
        logger.error(error_msg)
        checker_init_error = error_msg
        checker_initialized = False
        return # Stop initialization

    logger.debug(f"Required HIBP data file (.txt) found at: {data_path}")

    # --- Pre-check 2: Check if the Bloom filter file exists where the library expects it ---
    # This informs our status flag; the library handles the actual loading.
    if os.path.exists(expected_bloom_path_for_lib):
        logger.info(f"Bloom filter file found at the expected location: {expected_bloom_path_for_lib}. Library should use it automatically.")
        bloom_filter_likely_active = True
        # Optional: Log if the configured path differs from the expected one, although it shouldn't matter for library usage.
        if os.path.abspath(bloom_path_configured) != os.path.abspath(expected_bloom_path_for_lib):
             logger.warning(f"Note: Configured Bloom filter path '{bloom_path_configured}' differs from the path library uses '{expected_bloom_path_for_lib}', but the expected file exists.")
    else:
        logger.warning(f"Bloom filter file NOT FOUND at the location expected by the library: '{expected_bloom_path_for_lib}'. "
                       "Proceeding without Bloom filter acceleration (lookups will be significantly slower). "
                       "Ensure '{os.path.basename(expected_bloom_path_for_lib)}' is in the same directory as the .txt file ('{os.path.dirname(data_path)}').")
        bloom_filter_likely_active = False
        # Also log if the configured path check also failed (as expected)
        if not os.path.exists(bloom_path_configured):
            logger.debug(f"Configured Bloom filter path check also confirmed file not found at '{bloom_path_configured}'.")
        else:
             logger.warning(f"Odd: Configured Bloom filter path '{bloom_path_configured}' exists, but the library's expected path '{expected_bloom_path_for_lib}' does not. Filter will likely NOT be used.")

    # --- Initialize the Checker ---
    try:
        # Initialize the checker using ONLY the data_file path.
        # The library handles finding/using the .bloom file internally if it exists
        # at the expected location (same dir, same base name as data_file).
        logger.info(f"Initializing PwnedPasswordsOfflineChecker with data_file='{data_path}'...")
        checker_instance = PwnedPasswordsOfflineChecker(data_file=data_path)

        # Open the memory-mapped file - crucial for performance with repeated lookups.
        logger.info("Opening memory-mapped file for HIBP checker...")
        checker_instance.open()
        logger.info("PwnedPasswordsOfflineChecker initialized and file opened successfully.")

        # Log the expected acceleration status based on our file check
        logger.info(f"Bloom filter acceleration expected to be active: {'Yes' if bloom_filter_likely_active else 'No'}")

        checker_initialized = True
        checker_init_error = None

        # Optional: Perform a quick test lookup to confirm basic functionality
        try:
             test_password = "password123" # A common password likely in the list
             is_pwned = checker_instance.lookup_raw_password(test_password)
             logger.info(f"Initial test lookup for '{test_password}' successful. Result: {'Pwned' if is_pwned else 'Not Pwned'}. Checker operational.")
        except Exception as test_e:
             # This shouldn't typically fail if init/open succeeded, but good to catch.
             logger.warning(f"Initial HIBP test lookup failed unexpectedly after successful init/open: {test_e}", exc_info=True)
             # Depending on severity, you might want to mark as uninitialized here.
             # checker_initialized = False
             # checker_init_error = f"Initialization succeeded, but initial test lookup failed: {test_e}"

    except FileNotFoundError as fnf_error:
        # Should be caught by the initial os.path.exists, but acts as a safeguard.
        error_msg = f"Initialization failed: File Not Found Error during PwnedPasswordsOfflineChecker instantiation - {fnf_error}. Ensure data file exists at '{data_path}'."
        logger.error(error_msg, exc_info=True) # Log traceback
        checker_init_error = error_msg
        checker_instance = None
        checker_initialized = False
    except MemoryError as mem_error:
         error_msg = (f"Initialization failed: Memory Error - {mem_error}. "
                      "The system may not have enough RAM to memory-map the HIBP data file. "
                      "Consider using a machine with more memory or alternative checking methods if feasible.")
         logger.error(error_msg, exc_info=True)
         checker_init_error = error_msg
         checker_instance = None
         checker_initialized = False
    except Exception as e:
        # Catch any other unexpected errors during library initialization or file opening.
        error_msg = f"Fatal error initializing HIBP Checker or opening data file: {type(e).__name__} - {e}"
        logger.exception(error_msg) # Log full traceback for unexpected errors
        checker_init_error = error_msg
        checker_instance = None
        checker_initialized = False
    finally:
         # Log final initialization outcome
         if checker_initialized:
             logger.info("HIBP checker initialization SUCCEEDED.")
         else:
             logger.error("HIBP checker initialization FAILED.")


@router.on_event("shutdown")
async def shutdown_hibp_checker():
    """
    Cleans up the HIBP checker instance and resources on application shutdown.
    """
    global checker_instance, checker_initialized, checker_init_error, bloom_filter_likely_active
    logger.info("HIBP Checker Router: Shutting down...")
    if checker_instance:
        try:
            # The library provides a close() method to release the memory-mapped file.
            logger.info("Closing HIBP checker instance (releasing memory-mapped file)...")
            checker_instance.close()
            logger.info("HIBP checker instance closed successfully.")
        except Exception as e:
            # Log if closing fails, though it's less critical than initialization errors.
            logger.warning(f"Error occurred during checker_instance.close(): {e}", exc_info=True)

    # Reset global state variables
    checker_instance = None
    checker_initialized = False
    checker_init_error = None
    bloom_filter_likely_active = False
    logger.info("HIBP Checker instance and state cleared.")


# --- API Endpoints ---

@router.get(
    "/check-password/",
    summary="Check if a Password is Pwned (Offline)",
    description=(
        "Checks a given password against the locally stored HIBP pwned passwords database. "
        "Uses the `pwnedpasswords-offline` library. If a corresponding `.bloom` filter file "
        "is present alongside the `.txt` data file, lookups are significantly faster. "
        "The password itself is **not** sent over the network beyond this API endpoint."
    ),
    response_description="A JSON object indicating whether the password was found ('pwned': true/false) and the check method.",
    tags=["HIBP Checker"], # Redundant if set on router inclusion
    responses={
        status.HTTP_200_OK: {"description": "Password check completed successfully."},
        status.HTTP_400_BAD_REQUEST: {"description": "Password query parameter is missing or empty."},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Internal error during the HIBP lookup."},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "HIBP checker service is not initialized or unavailable."},
    }
)
async def check_password_endpoint(
    password: str = Query(
        ..., # Ellipsis makes the parameter required
        min_length=1,
        title="Password to Check",
        description="The raw password string to check against the offline HIBP database.",
        example="password123"
    )
):
    """
    Endpoint to check a single password against the offline HIBP database.
    """
    # --- Pre-check: Ensure HIBP checker is ready ---
    if not checker_initialized or checker_instance is None:
        logger.error("HIBP /check-password/ endpoint called but checker is not initialized.")
        detail_msg = "HIBP checker service is currently unavailable."
        if checker_init_error:
            detail_msg += f" Reason: {checker_init_error}"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail_msg
        )

    logger.debug(f"Received request to check password (length={len(password)})")

    try:
        # --- Perform the Lookup ---
        # Use the `lookup_raw_password()` method which takes the plaintext password,
        # hashes it internally (SHA1), and checks against the database (using Bloom filter first if active).
        is_pwned = checker_instance.lookup_raw_password(password)

        status_message = "password_found_in_HIBP_database" if is_pwned else "password_not_found_in_HIBP_database"
        # Provide context on how the check was performed (Bloom accelerated or not)
        check_method_info = "offline_lookup"
        if bloom_filter_likely_active:
             check_method_info += "_with_bloom_filter"
        else:
             check_method_info += "_without_bloom_filter"

        logger.info(f"Password check result: {'Pwned' if is_pwned else 'Not Pwned'}. Method: {check_method_info}.")

        # --- Return the Result ---
        # Keep the response clear and focused.
        return {
            "password_provided": True, # Indicate that a password was received (for clarity vs. empty query)
            "pwned": is_pwned,         # The primary boolean result
            "status_message": status_message,
            "check_method": check_method_info,
        }

    except Exception as e:
        # Catch unexpected errors during the lookup process itself.
        logger.exception(f"Error during HIBP lookup for password (length={len(password)}): {type(e).__name__} - {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during the HIBP password check: {type(e).__name__}."
        )


@router.get(
    "/health",
    summary="HIBP Checker Service Health Check",
    description="Checks the initialization status of the offline HIBP checker service and whether Bloom filter acceleration is likely active.",
    response_description="JSON object indicating the health status ('ok' or 'unhealthy') and details.",
    tags=["HIBP Checker"],
    responses={
        status.HTTP_200_OK: {"description": "Service is initialized and operational."},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "Service is not initialized or encountered an error."},
    }
)
async def health_check_endpoint():
    """
    Performs a health check on the HIBP checker service.
    """
    logger.debug("Performing HIBP health check...")
    if checker_initialized and checker_instance is not None:
         status_message = "HIBP Checker is initialized and operational."
         bloom_status = "active" if bloom_filter_likely_active else "inactive"
         status_message += f" Bloom filter acceleration is likely {bloom_status}."
         logger.info(f"Health Check: Status OK. {status_message}")
         return {
             "status": "ok",
             "message": status_message,
             "bloom_filter_active": bloom_filter_likely_active,
             "data_file_path": config.HIBP_DATA_PATH # Show the configured path
         }
    else:
        # If not initialized, return an unhealthy status
        logger.warning(f"Health Check: Status Unhealthy. Reason: {checker_init_error}")
         # Use status code 503 Service Unavailable for the health check response itself
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "reason": checker_init_error or "HIBP Checker failed to initialize or is not available.",
                "data_file_path": config.HIBP_DATA_PATH, # Still useful to show the path it tried
                "bloom_filter_active": False # Cannot be active if not initialized
            }
        )


@router.get(
    "/",
    summary="HIBP Checker Service Root",
    description="Provides basic information about the HIBP checker service configuration and initialization status.",
    response_description="JSON object with service details.",
    tags=["HIBP Checker"]
)
async def read_hibp_root():
    """
    Root endpoint for the HIBP checker service.
    Returns configuration paths and current status.
    """
    logger.debug("HIBP root endpoint '/' accessed")

    status_detail = "initialized_ok"
    if not checker_initialized:
        status_detail = f"initialization_failed (Error: {checker_init_error})" if checker_init_error else "not_initialized"

    bloom_status = "likely_active" if bloom_filter_likely_active else "inactive_or_not_found"

    # Path the library implicitly checks for the bloom filter
    expected_bloom_path = "N/A (data path not configured)"
    if config.HIBP_DATA_PATH:
        expected_bloom_path = os.path.splitext(config.HIBP_DATA_PATH)[0] + ".bloom"

    return {
        "service_name": "Offline HIBP Password Checker",
        "description": "Checks passwords locally against the HIBP database.",
        "library": "pwnedpasswords-offline",
        "status": status_detail,
        "configuration": {
             "hibp_data_txt_file_path": config.HIBP_DATA_PATH,
             "expected_bloom_filter_path": expected_bloom_path,
             "bloom_filter_status": bloom_status,
        }
    }