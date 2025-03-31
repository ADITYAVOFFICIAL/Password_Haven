#!/usr/bin/env python3
"""
Configuration module for the Backend API.

Loads settings from environment variables and .env files.
Provides central access to configuration values like file paths,
API settings, and external service details.
"""

import os
import logging
from dotenv import load_dotenv

# Load environment variables from a .env file if it exists in the project root
# This allows for easy configuration during development without setting system env vars.
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env') # Assumes .env is in project root
load_dotenv(dotenv_path=dotenv_path)
# print(f"Attempted to load .env file from: {dotenv_path}") # Uncomment for debugging .env loading

# --- Logger ---
# Setup a logger specifically for configuration loading messages
logger_config = logging.getLogger("config")

# --- Project Root ---
# Determine the absolute path to the project root directory (one level up from 'back')
# This is useful for constructing absolute paths to data files etc.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
logger_config.debug(f"Project Root directory determined as: {PROJECT_ROOT}")

# --- HIBP Checker Configuration ---
# Configuration for the offline Have I Been Pwned password checker.

# **IMPORTANT: Understanding HIBP File Paths**
# The `pwnedpasswords_offline` library requires the path to the original HIBP
# SHA1 hash data file (e.g., 'pwned-passwords-sha1-ordered-by-hash-v8.txt')
# during its initialization (`__init__`).
#
# Even if you only intend to use the Bloom filter (`.bloom` file) for faster
# lookups, the library *still needs the path to the corresponding .txt file*
# to correctly locate and potentially use the Bloom filter.
#
# The library automatically looks for a `.bloom` file with the SAME BASE NAME
# and in the SAME DIRECTORY as the provided `.txt` file path.

# 1. HIBP Data File (.txt) - REQUIRED FOR INITIALIZATION
HIBP_DATA_FILENAME_DEFAULT = "pwned-passwords-sha1-ordered-by-hash-v8.txt"
HIBP_DATA_FILENAME = os.getenv("HIBP_DATA_FILENAME", HIBP_DATA_FILENAME_DEFAULT)

# Define the directory where HIBP data files (.txt and .bloom) are expected.
# It's recommended to place this directory OUTSIDE the 'back' source code folder,
# for example, in a 'data/HIBP' or 'HIBP_data' directory at the project root.
HIBP_DATA_DIR_DEFAULT = os.path.join(PROJECT_ROOT, "HIBP_data")
HIBP_DATA_DIR = os.getenv("HIBP_DATA_DIR", HIBP_DATA_DIR_DEFAULT)

# Construct the full path to the HIBP .txt data file.
# This path MUST be provided to the PwnedPasswordsOfflineChecker constructor.
HIBP_DATA_PATH = os.path.join(HIBP_DATA_DIR, HIBP_DATA_FILENAME)

logger_config.info(f"HIBP Config: Required .txt data path for library init: {HIBP_DATA_PATH}")

# Check if the required .txt file exists for clarity, although the library itself will error if missing.
if not os.path.exists(HIBP_DATA_PATH):
     logger_config.warning(f"HIBP Config: The required HIBP data file (.txt) was NOT FOUND at: {HIBP_DATA_PATH}. "
                           "Checker initialization WILL FAIL.")
else:
     logger_config.debug(f"HIBP Config: Found required HIBP data file (.txt) at: {HIBP_DATA_PATH}")

# 2. HIBP Bloom Filter File (.bloom) - USED FOR ACCELERATION (if found by library)
# The filename is derived from the .txt filename.
BLOOM_FILTER_FILENAME_DEFAULT = HIBP_DATA_FILENAME.replace(".txt", ".bloom")
BLOOM_FILTER_FILENAME = os.getenv("BLOOM_FILTER_FILENAME", BLOOM_FILTER_FILENAME_DEFAULT)

# The Bloom filter MUST reside in the SAME directory as the .txt file for the library to find it automatically.
# Therefore, we use HIBP_DATA_DIR here as well.
BLOOM_FILTER_PATH = os.path.join(HIBP_DATA_DIR, BLOOM_FILTER_FILENAME)

logger_config.info(f"HIBP Config: Expected Bloom filter path (auto-detected by library if present): {BLOOM_FILTER_PATH}")

# Check if the Bloom filter file exists at the expected location.
if not os.path.exists(BLOOM_FILTER_PATH):
    logger_config.warning(f"HIBP Config: Bloom filter file NOT FOUND at the expected path: {BLOOM_FILTER_PATH}. "
                          "Checker will operate without Bloom filter acceleration (slower lookups).")
else:
    logger_config.info("HIBP Config: Bloom filter file found. Library should automatically use it for faster lookups.")


# --- Ollama Analyzer Configuration ---
# Configuration for interacting with the local Ollama service.

# Model name to use for analysis (e.g., "llama3", "mistral", "gemma:2b")
OLLAMA_MODEL_DEFAULT = "gemma3:4b" # Changed default example
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", OLLAMA_MODEL_DEFAULT)

# Host URL of the running Ollama service (including protocol and port)
OLLAMA_HOST_DEFAULT = "http://127.0.0.1:11434" # Default Ollama API endpoint
OLLAMA_HOST = os.getenv("OLLAMA_HOST", OLLAMA_HOST_DEFAULT)

# Timeout (in seconds) for requests to the Ollama service. Increase if requests often time out.
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

# --- General App Configuration ---
# Settings for the FastAPI application server itself.

# Port on which the API server will listen.
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
# '0.0.0.0' makes the server accessible from other machines on the network.
# '127.0.0.1' (or 'localhost') restricts access to the local machine only.
API_HOST_DEFAULT = "0.0.0.0"
API_HOST = os.getenv("API_HOST", API_HOST_DEFAULT)

# Logging level for the application (e.g., DEBUG, INFO, WARNING, ERROR, CRITICAL)
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