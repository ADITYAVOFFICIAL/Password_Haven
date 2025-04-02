#!/usr/bin/env python3
"""
Main FastAPI application setup for Password Services API.

Initializes the FastAPI app, configures logging, sets up CORS middleware,
includes API routers for different services (HIBP, Ollama), and defines
a root endpoint.
"""
import logging
import uvicorn
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
from pathlib import Path
# --- Path Setup for Imports ---
# Ensure the project root and 'back' directory are in the Python path
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(current_dir) not in sys.path:
     sys.path.insert(0, str(current_dir))

# --- Import Configuration and Routers ---
try:
    from . import config
    from .hibp_checker.router import router as hibp_router # Import HIBP router
    from .ollama_analyzer.router import router as ollama_router # Import Ollama router
    from .hashcat.router import router as hashcat_router
    from .ml_analyzer.router import router as ml_router
    from .ml_analyzer.router import load_ml_model
except ImportError:
    # Fallback for running the script directly (python back/main.py) - less ideal
    try:
        import config
        from hibp_checker.router import router as hibp_router
        from ollama_analyzer.router import router as ollama_router
        from hashcat.router import router as hashcat_router
        from ml_analyzer.router import router as ml_router
        from ml_analyzer.router import load_ml_model
    except ImportError as e2:
         print(f"Fallback import failed: {e2}. Exiting.")
         sys.exit(1) # Exit if core components can't be imported


# --- Logging Setup ---
# Configure logging using the level and format from config
# Ensure this runs after config is loaded
logging.basicConfig(
    level=config.LOG_LEVEL,
    format='%(asctime)s [%(name)-25s] [%(levelname)-8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    # Force=True might be needed if uvicorn tries to configure logging first
    force=True
)
# Get a logger instance for this main application file
logger = logging.getLogger("main_app")
logger.info(f"Logging configured with level: {config.LOG_LEVEL}")



# --- FastAPI Application Initialization ---
# Initialize the FastAPI application with metadata for documentation
app = FastAPI(
    title="Password Services API",
    description=(
        "An API providing password security services, including:\n"
        "- **Offline HIBP Check:** Uses a local HIBP database (Bloom filter accelerated if available) "
        "to check if a password has been pwned, without sending the password online.\n"
        "- **Ollama Password Analysis:** Leverages a local Ollama LLM instance to analyze "
        "password strength, provide reasoning, and suggest improvements."
    ),
    version="1.0.0", # Incremented version for documentation/feature enhancements
    contact={
        "name": "API Support",
        "url": "https://adityaver.vercel.app/", # Replace with actual support URL
        "email": "av4923@srmist.edu.in",     # Replace with actual support email
    },
    license_info={
        "name": "MIT License", # Or your chosen license
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url="/docs", # Endpoint for Swagger UI documentation
    redoc_url="/redoc" # Endpoint for ReDoc documentation
)

# --- CORS Middleware Configuration ---
# Configure Cross-Origin Resource Sharing (CORS) to allow frontend interactions.
# SECURITY WARNING: Allowing all origins ["*"] is insecure for production environments.
# In production, restrict origins to the specific domain(s) of your frontend application.
# Example for production: origins = ["https://your-frontend-domain.com", "http://localhost:3000"]
logger.warning("CORS middleware allows all origins ('*'). "
               "This is insecure for production. Restrict origins in config/env vars.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # CHANGE FOR PRODUCTION! Read from config ideally.
    allow_credentials=True, # Allow cookies/auth headers if needed by your frontend
    allow_methods=["GET", "POST", "OPTIONS"], # Specify allowed HTTP methods (more restrictive)
    allow_headers=["*"], # Allow specific headers needed by the frontend, e.g., ["Content-Type", "Authorization"]
)

@app.on_event("startup")
def startup_event():
    """Execute tasks when the application starts."""
    logger.info("Starting application...")
    
    # Load ML model at startup
    logger.info("Loading ML model...")
    load_ml_model()
# --- Include API Routers ---
# Mount the HIBP checker router under the /hibp path prefix
logger.info("Including HIBP Checker router under '/hibp'")
app.include_router(
    hibp_router,
    prefix="/hibp",
    tags=["HIBP Checker"] # Group endpoints under this tag in API docs
)

# Mount the Ollama analyzer router under the /ollama path prefix
logger.info("Including Ollama Analyzer router under '/ollama'")
app.include_router(
    ollama_router,
    prefix="/ollama",
    tags=["Ollama Analyzer"] # Group endpoints under this tag in API docs
)
# <<< Include Hashcat router >>>
logger.info("Including Hashcat Cracker router under '/hashcat'")
app.include_router(
    hashcat_router,
    prefix="/hashcat",        # Define the base path for hashcat endpoints
    tags=["Hashcat Cracker"]  # Group endpoints under this tag in API docs
)
logger.info("Including ML Analyzer router under '/ml'")
app.include_router(ml_router, prefix="/ml", tags=["ML Analyzer"])
# --- Root Endpoint ---
@app.get(
    "/",
    tags=["Root"],
    summary="API Root Endpoint",
    description="Provides basic information about the API, its version, and links to available service endpoints and documentation.",
    response_description="A welcome message and structured information about the API.",
)
async def read_root():
    """
    Root endpoint providing essential API information.
    """
    logger.debug("Root endpoint '/' accessed")
    return {
        "message": "Welcome to the Password Services API Portal",
        "version": app.version,
        "api_status": "operational", # Added a simple status indicator
        "documentation_links": {
            "swagger_ui": app.docs_url,
            "redoc": app.redoc_url
        },
        "available_service_endpoints": {
            "/hibp": {
                "summary": "Offline HIBP Password Checker",
                "description": "Checks passwords against the HIBP database locally using a Bloom filter if available.",
                "root_info": "/hibp/",
                "health_check": "/hibp/health",
                "check_endpoint": "/hibp/check-password/?password={your_password}"
            },
            "/ollama": {
                "summary": "Ollama Password Analyzer",
                "description": "Analyzes password strength and provides suggestions using a local Ollama LLM.",
                "root_info": "/ollama/",
                "health_check": "/ollama/health",
                "analyze_endpoint_POST": "/ollama/generateContent"
            },
            "/hashcat": {
                "summary": "Hashcat Password Cracker",
                "description": "Initiates dictionary attacks using a local Hashcat instance.",
                "root_info": "/hashcat/",
                "health_check": "/hashcat/health",
                "crack_endpoint_POST": "/hashcat/crack"
            },
            "/ml": {
                "summary": "ML Password Strength Analyzer",
                "description": "Analyzes password strength using a pre-trained LightGBM model.",
                "health_check": "/ml/health",
                "analyze_endpoint_POST": "/ml/analyze"
            }
        },
        "contact": app.contact, # Include contact info from app definition
    }

# --- Run Command (for development convenience) ---
# This block allows running the app directly using `python back/main.py`,
# but the recommended way for development is using `uvicorn back.main:app --reload`.
if __name__ == "__main__":
    logger.info(f"Attempting to start Uvicorn server programmatically on {config.API_HOST}:{config.API_PORT}")
    # Provide clear instructions for the recommended development approach
    print("\n--- Running main.py directly ---")
    print("This method is suitable for simple testing but lacks auto-reload.")
    print(f"RECOMMENDED development command (run from '{config.PROJECT_ROOT}'):")
    print(f"uvicorn back.main:app --host {config.API_HOST} --port {config.API_PORT} --reload --log-level {config.LOG_LEVEL.lower()}")
    print("---------------------------------\n")

    # Run the Uvicorn server programmatically
    uvicorn.run(
        "back.main:app", # Path to the FastAPI app object (string format)
        host=config.API_HOST,
        port=config.API_PORT,
        log_level=config.LOG_LEVEL.lower(), # Sync Uvicorn log level with app config
        reload=False # Auto-reload is better handled by the CLI runner
    )