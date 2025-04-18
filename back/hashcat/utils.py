# back/hashcat/utils.py
import asyncio
import logging
import tempfile
import os
from pathlib import Path
import time
from typing import Tuple, Optional

# Import the central configuration object using relative import
try:
    from .. import config
except ImportError:
    # Fallback for potential direct execution (less ideal)
    import config

logger = logging.getLogger(__name__) # Get logger specific to this module

async def run_hashcat_async(
    hash_value: str,
    hash_mode: int,
    wordlist_path: Path
) -> Tuple[Optional[str], float, str, int]:
    """
    Asynchronously runs hashcat in dictionary attack mode using central config.
    Handles cases where the hashcat path is not configured.

    Args:
        hash_value: The hash string to crack.
        hash_mode: The hashcat mode number.
        wordlist_path: The absolute path to the wordlist file.

    Returns:
        A tuple containing:
        - Cracked password (str or None if not found).
        - Elapsed time in seconds (float).
        - Full stdout/error message from hashcat (str).
        - Hashcat process return code (int) or -2 if not configured.
    """
    hashcat_executable = config.HASHCAT_PATH # Use path from central config
    
    # <<< Add check for None path >>>
    if not hashcat_executable:
        logger.error("Hashcat execution skipped: HASHCAT_PATH is not configured or hashcat was not found.")
        # Return a specific state indicating configuration error
        return None, 0.0, "Hashcat path is not configured or executable not found.", -2 # Use -2 for config errors

    # Check if hashcat executable exists and is executable
    if not os.path.isfile(hashcat_executable) or not os.access(hashcat_executable, os.X_OK):
        logger.error(f"Hashcat executable not found or not executable at: {hashcat_executable}")
        # Raise specific error to be caught by the router
        raise FileNotFoundError(f"Hashcat executable misconfigured or not found at: {hashcat_executable}")

    temp_hash_file_path = None # Initialize path variable
    try:
        # Create a temporary file to store the hash
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=".hash", encoding='utf-8') as tf:
            tf.write(hash_value + "\n")
            temp_hash_file_path = tf.name
        logger.info(f"Created temporary hash file: {temp_hash_file_path}")

        # Construct the hashcat command
        command = [
    hashcat_executable,
    "-m", str(hash_mode),
    "-a", "0",  # Dictionary attack mode
    "-O",
    temp_hash_file_path,
    str(wordlist_path),  # Ensure wordlist path is a string
    "--backend-ignore-opencl",
    "--potfile-disable",
    # "--quiet",  # Uncomment for less verbose output
    # "--force"   # Uncomment if needed (CPU-only, driver issues) - use with caution
]


        logger.info(f"Executing hashcat command: {' '.join(command)}")
        start_time = time.monotonic()

        # Run hashcat asynchronously
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        # Capture output
        stdout, stderr = await process.communicate()
        end_time = time.monotonic()
        elapsed_time = end_time - start_time

        # Decode output
        stdout_str = stdout.decode('utf-8', errors='ignore')
        stderr_str = stderr.decode('utf-8', errors='ignore')

        # Log results
        logger.info(f"Hashcat process finished for hash '{hash_value[:10]}...' with return code: {process.returncode}")
        if stdout_str:
            # Log only first few lines of stdout unless DEBUG level
            log_stdout = '\n'.join(stdout_str.splitlines()[:5]) + ('...' if len(stdout_str.splitlines()) > 5 else '')
            if logger.isEnabledFor(logging.DEBUG):
                 logger.debug(f"Hashcat stdout:\n{stdout_str}")
            else:
                 logger.info(f"Hashcat stdout (truncated):\n{log_stdout}")

        if stderr_str:
            logger.warning(f"Hashcat stderr:\n{stderr_str}") # Log stderr as warning

        # Attempt to parse the cracked password from stdout
        cracked_password = None
        if process.returncode in [0, 1]: # 0 = finished, 1 = finished with warnings (often means cracked)
            lines = stdout_str.strip().splitlines()
            # Look for the line containing the original hash followed by the password
            # Format is often HASH:PASSWORD, but can vary slightly.
            # This parsing might need adjustment based on hashcat version/output.
            for line in reversed(lines): # Check from the end, often where results appear
                if line.strip() and ':' in line:
                    # Basic check: does the part before the *last* colon match the hash?
                    # This is fragile; more robust parsing might be needed for complex outputs.
                    parts = line.rsplit(':', 1)
                    potential_hash = parts[0]
                    potential_pass = parts[1]
                    # Simple check, might fail with salts etc.
                    if potential_hash.endswith(hash_value): # Check if the hash is at the end of the first part
                         cracked_password = potential_pass
                         logger.info(f"Successfully cracked hash {hash_value[:10]}... -> '{cracked_password}'")
                         break
            if not cracked_password:
                 logger.info(f"Hash {hash_value[:10]}... was not found in the wordlist by hashcat.")

        return cracked_password, elapsed_time, stdout_str, process.returncode

    except FileNotFoundError as e:
        # Specific handling for the hashcat executable not found error raised earlier
        logger.error(f"Hashcat execution failed: {e}")
        raise e # Re-raise to be caught by the API endpoint
    except Exception as e:
        logger.exception(f"An unexpected error occurred while running hashcat: {e}")
        # Return an error state that the router can interpret
        return None, 0.0, f"Internal error running hashcat: {e}", -1 # Use -1 for internal errors
    finally:
        # Ensure the temporary file is deleted
        if temp_hash_file_path and os.path.exists(temp_hash_file_path):
            try:
                os.remove(temp_hash_file_path)
                logger.debug(f"Removed temporary hash file: {temp_hash_file_path}")
            except OSError as e:
                logger.error(f"Error removing temporary hash file {temp_hash_file_path}: {e}")