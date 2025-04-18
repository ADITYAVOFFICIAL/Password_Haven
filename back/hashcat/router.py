# back/hashcat/router.py
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from pathlib import Path
# Use relative imports for modules within the 'hashcat' subpackage
from .models import CrackRequest, CrackResponse
from .utils import run_hashcat_async
import os
# Import the central configuration object using relative import
try:
    from .. import config
except ImportError:
    # Fallback for potential direct execution (less ideal)
    import config

# Get logger specific to this router module
logger = logging.getLogger(__name__)

# Create an APIRouter instance for Hashcat related endpoints
router = APIRouter()

# --- Health Check Endpoint ---
@router.get(
    "/health",
    tags=["Hashcat Cracker"],
    summary="Check Hashcat Service Health",
    description="Checks if the Hashcat router is reachable and if the configured executable is found.",
    status_code=status.HTTP_200_OK,
)
async def hashcat_health():
    """
    Simple health check for the Hashcat service component.
    Verifies basic configuration like executable path existence.
    """
    logger.debug("Hashcat health check endpoint accessed.")
    hashcat_executable = config.HASHCAT_PATH
    health_status = {"status": "ok", "message": "Hashcat service is running."}

    if not Path(hashcat_executable).is_file() or not os.access(hashcat_executable, os.X_OK):
        logger.warning(f"Health Check Warning: Hashcat executable not found or not executable at configured path: {hashcat_executable}")
        health_status["status"] = "warning"
        health_status["message"] = f"Hashcat service is running, but the executable at '{hashcat_executable}' is missing or not executable. Cracking will fail."
        # Return 200 OK but with a warning message
    else:
         health_status["executable_status"] = "found_and_executable"

    if not config.WORDLISTS_DIR.is_dir():
         logger.warning(f"Health Check Warning: Wordlists directory not found at configured path: {config.WORDLISTS_DIR}")
         health_status["status"] = "warning"
         health_status["wordlist_dir_status"] = f"Configured wordlists directory '{config.WORDLISTS_DIR}' not found."


    return health_status


# --- Crack Endpoint ---
@router.post(
    "/crack",
    response_model=CrackResponse,
    summary="Initiate a Hashcat Cracking Task",
    description="Submits a hash, hash mode, and wordlist filename to attempt cracking using hashcat via dictionary attack.",
    tags=["Hashcat Cracker"],
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "Wordlist file not found"},
        status.HTTP_400_BAD_REQUEST: {"description": "Invalid input data"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Hashcat execution error or internal server issue"},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "Hashcat executable not configured or found"}, # Added 503
    }
)
async def crack_hash_endpoint(request: CrackRequest):
    """
    Endpoint to start a hash cracking process using Hashcat.

    Requires:
    - **hash_value**: The hash string to crack.
    - **hash_mode**: The numeric hashcat mode.
    - **wordlist_filename**: The name of the wordlist file (e.g., `rockyou.txt`)
      located in the directory specified by the `WORDLISTS_DIR` config variable.
    """
    logger.info(f"Received hashcat crack request for mode {request.hash_mode} using wordlist '{request.wordlist_filename}'")

    # Construct the full path to the wordlist using central config
    wordlist_path = config.WORDLISTS_DIR / request.wordlist_filename

    # Validate wordlist existence
    if not wordlist_path.is_file():
        logger.error(f"Wordlist file not found at expected path: {wordlist_path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wordlist file '{request.wordlist_filename}' not found in configured directory '{config.WORDLISTS_DIR}'. Please ensure the file exists on the server."
        )

    logger.debug(f"Using wordlist: {wordlist_path}")

    try:
        # Run hashcat asynchronously using the utility function
        cracked_password, elapsed_time, output, return_code = await run_hashcat_async(
            hash_value=request.hash_value,
            hash_mode=request.hash_mode,
            wordlist_path=wordlist_path
        )

        # <<< Handle new return code -2 for config error >>>
        if return_code == -2:
            logger.error(f"Hashcat configuration error prevented execution: {output}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE, # Use 503 Service Unavailable
                detail=output # Pass the specific error message
            )
        elif return_code == -1: # Internal error within run_hashcat_async
             logger.error(f"Internal error during hashcat execution: {output}")
             raise HTTPException(
                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                 detail=f"Internal server error during hashcat execution. Check server logs."
             )

        # Determine response based on other return codes
        if cracked_password:
            status_msg = "success"
            message = "Hash successfully cracked."
            logger.info(f"Crack successful for hash {request.hash_value[:10]}...")
        elif return_code in [0, 1]:
             status_msg = "failed"
             message = "Hash not found in the provided wordlist."
             logger.info(f"Crack failed (not found) for hash {request.hash_value[:10]}...")
        else: # Hashcat exited with an unexpected error code
             status_msg = "error"
             message = f"Hashcat process failed unexpectedly with return code {return_code}. Check server logs or hashcat_output for details."
             logger.error(f"Hashcat process failed for hash {request.hash_value[:10]}... Return code: {return_code}")

        return CrackResponse(
            status=status_msg,
            cracked_password=cracked_password,
            hash_value=request.hash_value,
            hash_mode=request.hash_mode,
            wordlist_used=request.wordlist_filename,
            elapsed_time_seconds=round(elapsed_time, 2) if elapsed_time is not None else None,
            message=message,
            hashcat_output=output
        )

    except FileNotFoundError as e:
         # Handle case where hashcat executable itself is misconfigured/not found (raised from util)
         logger.error(f"Hashcat configuration error: {e}")
         raise HTTPException(
             status_code=status.HTTP_503_SERVICE_UNAVAILABLE, # Use 503 for config issues
             detail=str(e)
         )
    except Exception as e:
        logger.exception(f"An unexpected error occurred in the /hashcat/crack endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected server error occurred: {str(e)}"
        )