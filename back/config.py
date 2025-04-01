#!/usr/bin/env python3
"""
Configuration module for the Backend API.

Loads settings from environment variables and .env files.
Provides central access to configuration values like file paths,
API settings, and external service details.

Prioritizes finding 'hashcat' executable via environment variable,
then searches system PATH, requiring manual setting if not found.
"""

import os
import logging
import shutil  # Used to search system PATH
from pathlib import Path # Use Path objects for consistency
from dotenv import load_dotenv

# --- Load .env and Logger Setup ---
# Load environment variables from a .env file if it exists in the project root
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env') # Assumes .env is one level up
load_dotenv(dotenv_path=dotenv_path)
# Setup a logger specifically for configuration loading messages
logger_config = logging.getLogger("config")

# --- Project Root ---
# Determine the absolute path to the project root directory (one level up from 'back')
PROJECT_ROOT = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
logger_config.debug(f"Project Root directory determined as: {PROJECT_ROOT}")

# --- HIBP Checker Configuration ---
# Configuration for the offline Have I Been Pwned password checker.
HIBP_DATA_FILENAME_DEFAULT = "pwned-passwords-sha1-ordered-by-hash-v8.txt"
HIBP_DATA_FILENAME = os.getenv("HIBP_DATA_FILENAME", HIBP_DATA_FILENAME_DEFAULT)

# Define the directory where HIBP data files (.txt and .bloom) are expected.
HIBP_DATA_DIR_DEFAULT = PROJECT_ROOT / "HIBP_data" # Use Path object for directory
HIBP_DATA_DIR = Path(os.getenv("HIBP_DATA_DIR", str(HIBP_DATA_DIR_DEFAULT))) # Convert default to str for getenv

# Construct the full path to the HIBP .txt data file.
HIBP_DATA_PATH = HIBP_DATA_DIR / HIBP_DATA_FILENAME

logger_config.info(f"HIBP Config: Required .txt data path for library init: {HIBP_DATA_PATH}")
# Check if the required .txt file exists
if not HIBP_DATA_PATH.is_file(): # Use Path.is_file()
     logger_config.warning(f"HIBP Config: The required HIBP data file (.txt) was NOT FOUND at: {HIBP_DATA_PATH}. "
                           "Checker initialization WILL FAIL.")
else:
     logger_config.debug(f"HIBP Config: Found required HIBP data file (.txt) at: {HIBP_DATA_PATH}")

# HIBP Bloom Filter File (.bloom) - Path derived from .txt file
BLOOM_FILTER_FILENAME_DEFAULT = HIBP_DATA_FILENAME.replace(".txt", ".bloom")
BLOOM_FILTER_FILENAME = os.getenv("BLOOM_FILTER_FILENAME", BLOOM_FILTER_FILENAME_DEFAULT)
BLOOM_FILTER_PATH = HIBP_DATA_DIR / BLOOM_FILTER_FILENAME # Must be in same dir as .txt

logger_config.info(f"HIBP Config: Expected Bloom filter path (auto-detected by library if present): {BLOOM_FILTER_PATH}")
# Check if the Bloom filter file exists at the expected location.
if not BLOOM_FILTER_PATH.is_file(): # Use Path.is_file()
    logger_config.warning(f"HIBP Config: Bloom filter file NOT FOUND at the expected path: {BLOOM_FILTER_PATH}. "
                          "Checker will operate without Bloom filter acceleration (slower lookups).")
else:
    logger_config.info("HIBP Config: Bloom filter file found. Library should automatically use it for faster lookups.")


# --- Ollama Analyzer Configuration ---
# Configuration for interacting with the local Ollama service.
OLLAMA_MODEL_DEFAULT = "gemma3:4b-it-q8_0" # Example model
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", OLLAMA_MODEL_DEFAULT)

OLLAMA_HOST_DEFAULT = "http://127.0.0.1:11434" # Default Ollama API endpoint
OLLAMA_HOST = os.getenv("OLLAMA_HOST", OLLAMA_HOST_DEFAULT)

OLLAMA_TIMEOUT_DEFAULT = 300.0 # Default to 5 minutes
OLLAMA_TIMEOUT_STR = os.getenv("OLLAMA_TIMEOUT", str(OLLAMA_TIMEOUT_DEFAULT))
try:
    OLLAMA_TIMEOUT: float = float(OLLAMA_TIMEOUT_STR)
except ValueError:
    logger_config.error(f"Invalid OLLAMA_TIMEOUT value '{OLLAMA_TIMEOUT_STR}'. Using default: {OLLAMA_TIMEOUT_DEFAULT}s")
    OLLAMA_TIMEOUT: float = OLLAMA_TIMEOUT_DEFAULT

logger_config.info(f"Ollama Config: Using model '{OLLAMA_MODEL}'")
logger_config.info(f"Ollama Config: Connecting to host '{OLLAMA_HOST}'")
logger_config.info(f"Ollama Config: Request timeout set to {OLLAMA_TIMEOUT} seconds")


# --- Hashcat Cracker Configuration (Platform Independent Logic) ---
hashcat_path_final = None
source_message = ""

# 1. Check Environment Variable (Highest Priority)
hashcat_path_env = os.getenv("HASHCAT_PATH")
if hashcat_path_env:
    logger_config.info(f"Hashcat Config: Using path from HASHCAT_PATH environment variable: '{hashcat_path_env}'")
    # Ensure it's an absolute path for clarity, though relative might work depending on context
    hashcat_path_final = os.path.abspath(hashcat_path_env)
    source_message = "from HASHCAT_PATH environment variable"
else:
    # 2. Try finding 'hashcat' in system PATH using shutil.which()
    logger_config.info("Hashcat Config: HASHCAT_PATH not set. Searching system PATH for 'hashcat'...")
    # shutil.which searches PATHEXT on Windows too (e.g., finds hashcat.exe)
    hashcat_in_path = shutil.which("hashcat")
    if hashcat_in_path:
        # shutil.which returns an absolute path
        logger_config.info(f"Hashcat Config: Found 'hashcat' executable in system PATH: '{hashcat_in_path}'")
        hashcat_path_final = hashcat_in_path
        source_message = "found in system PATH"
    else:
        # 3. Not found automatically - Requires manual configuration
        logger_config.error("Hashcat Config: 'hashcat' executable NOT FOUND in system PATH and HASHCAT_PATH environment variable is not set.")
        logger_config.error("Hashcat functionality will be unavailable unless HASHCAT_PATH is set correctly in your environment or .env file.")
        hashcat_path_final = None # Explicitly set to None
        source_message = "NOT FOUND automatically"

# Assign the determined path (or None) to the config variable used by the app
HASHCAT_PATH = hashcat_path_final

# Log the final outcome and check validity if a path was found
if HASHCAT_PATH:
    logger_config.info(f"Hashcat Config: Final executable path set to: '{HASHCAT_PATH}' ({source_message})")
    # Perform validation check on the final path
    if not os.path.isfile(HASHCAT_PATH):
        logger_config.error(f"Hashcat Config: The determined path '{HASHCAT_PATH}' is NOT a valid file.")
        logger_config.error("Hashcat functionality will likely fail. Please check the path.")
        HASHCAT_PATH = None # Treat invalid file path as not configured
    elif not os.access(HASHCAT_PATH, os.X_OK):
        logger_config.error(f"Hashcat Config: The determined path '{HASHCAT_PATH}' is NOT executable.")
        logger_config.error("Hashcat functionality will likely fail. Please check file permissions.")
        HASHCAT_PATH = None # Treat non-executable path as not configured
    else:
        logger_config.debug(f"Hashcat Config: Path '{HASHCAT_PATH}' appears valid and executable.")

else:
    # Already logged the error above if None due to not being found
    pass

# --- Wordlists Directory (remains the same) ---
WORDLISTS_DIR_DEFAULT = PROJECT_ROOT / "HIBP_data" # Use Path object
WORDLISTS_DIR = Path(os.getenv("WORDLISTS_DIR", str(WORDLISTS_DIR_DEFAULT))) # Convert default to str for getenv
logger_config.info(f"Hashcat Config: Wordlists directory set to: {WORDLISTS_DIR}")

# Check and create wordlists directory if needed
if not WORDLISTS_DIR.exists():
    logger_config.warning(f"Hashcat Config: Wordlists directory '{WORDLISTS_DIR}' does not exist. Creating it.")
    try:
        WORDLISTS_DIR.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        logger_config.error(f"Hashcat Config: Error creating wordlists directory '{WORDLISTS_DIR}': {e}")
elif not WORDLISTS_DIR.is_dir():
     logger_config.error(f"Hashcat Config: Path '{WORDLISTS_DIR}' exists but is not a directory.")


# --- General App Configuration ---
# Settings for the FastAPI application server itself.
API_PORT_DEFAULT = 8000
API_PORT_STR = os.getenv("API_PORT", str(API_PORT_DEFAULT))
try:
    API_PORT: int = int(API_PORT_STR)
    if not 1 <= API_PORT <= 65535:
        raise ValueError("Port number out of range")
except ValueError:
    logger_config.error(f"Invalid API_PORT value '{API_PORT_STR}'. Must be an integer between 1 and 65535. Using default: {API_PORT_DEFAULT}")
    API_PORT: int = API_PORT_DEFAULT

# Host interface the API server will bind to.
API_HOST_DEFAULT = "0.0.0.0" # Accessible on network
API_HOST = os.getenv("API_HOST", API_HOST_DEFAULT)

# Logging level for the application
LOG_LEVEL_DEFAULT = "INFO"
LOG_LEVEL = os.getenv("LOG_LEVEL", LOG_LEVEL_DEFAULT).upper()
# Validate log level
valid_log_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
if LOG_LEVEL not in valid_log_levels:
    logger_config.warning(f"Invalid LOG_LEVEL '{LOG_LEVEL}'. Must be one of {valid_log_levels}. Using default: {LOG_LEVEL_DEFAULT}")
    LOG_LEVEL = LOG_LEVEL_DEFAULT

logger_config.info(f"General Config: Log Level set to: {LOG_LEVEL}")
logger_config.info(f"General Config: API server will run on: http://{API_HOST}:{API_PORT}")

# --- Final Configuration Summary Log ---
logger_config.debug("Configuration loading complete.")