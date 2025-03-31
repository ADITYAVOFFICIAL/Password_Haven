# Password Services API Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- Add more badges as needed: build status, coverage, etc. -->

A Python FastAPI backend providing password security analysis services, including offline HIBP checking and local LLM-based strength analysis via Ollama.

## Features

*   **Offline HIBP Check:** Verifies if a password exists in the Have I Been Pwned database using a local data file (`.txt`).
*   **Bloom Filter Acceleration:** Significantly speeds up HIBP checks if a corresponding `.bloom` filter file is present alongside the `.txt` file.
*   **Ollama Password Analysis:** Leverages a locally running Ollama instance (e.g., using Llama 3, Gemma, Mistral) to:
    *   Analyze password strength.
    *   Provide reasoning for the analysis.
    *   Suggest improvements or generate stronger alternatives (model dependent).
    *   Returns results in a structured JSON format.
*   **FastAPI Framework:** Built using the modern, high-performance FastAPI web framework.
*   **Async Support:** Utilizes asynchronous operations for non-blocking I/O.
*   **Configuration:** Easily configurable via environment variables and a `.env` file.
*   **API Documentation:** Automatic interactive API documentation (Swagger UI & ReDoc).

## Technology Stack

*   **Backend:** Python 3.8+
*   **Framework:** FastAPI
*   **ASGI Server:** Uvicorn
*   **HIBP Checking:** `pwnedpasswords-offline` library
*   **LLM Interaction:** `ollama` Python client library
*   **Data Validation:** Pydantic
*   **Environment Vars:** `python-dotenv`

## Prerequisites

Before you begin, ensure you have the following installed and set up:

1.  **Python:** Version 3.8 or higher.
2.  **Pip:** Python package installer.
3.  **Git:** For cloning the repository.
4.  **Ollama Service:** A running instance of [Ollama](https://ollama.com/). Ensure the model you configure (e.g., `gemma2:9b`, `llama3`) is downloaded:

    ```
    ollama pull <your-chosen-model-name>
    ```
5.  **HIBP Data Files:**
    *   **Required:** The HIBP **`.txt`** file (SHA1 hashes, ordered by hash). Download from the [HIBP Pwned Passwords page](https://haveibeenpwned.com/Passwords) (look for the "ordered by hash" version).
    *   **Optional (Recommended):** The corresponding **`.bloom`** filter file for the `.txt` file version you downloaded. This drastically improves lookup speed. Generate it using tools compatible with the `pwnedpasswords-offline` library or find pre-generated ones if available.

## Setup and Installation

1.  **Clone the repository:**

    ```
    git clone <your-repository-url>
    cd <your-repository-name>
    ```

2.  **Create and activate a virtual environment:**

    ```
    python -m venv .venv
    # On Linux/macOS:
    source .venv/bin/activate
    # On Windows (Command Prompt):
    .\.venv\Scripts\activate.bat
    # On Windows (PowerShell):
    .\.venv\Scripts\Activate.ps1
    ```

3.  **Install dependencies:**

    ```
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**

    *   Copy the example environment file:

        ```
        cp .env.example .env
        ```
    *   Edit the `.env` file with your specific settings (see **Configuration** section below).

5.  **Place HIBP Data Files:**

    *   Create a directory to store the HIBP files. The default expected location is a folder named `HIBP_data` in the project root (same level as the `back` folder).

        ```
        mkdir HIBP_data
        ```
    *   Place the downloaded `.txt` file (e.g., `pwned-passwords-sha1-ordered-by-hash-v8.txt`) inside the `HIBP_data` directory.
    *   If using a Bloom filter, place the corresponding `.bloom` file (e.g., `pwned-passwords-sha1-ordered-by-hash-v8.bloom`) in the *same* `HIBP_data` directory.
    *   Ensure the filenames and directory match the configuration in your `.env` file (or the defaults in `back/config.py`).

## Running the Application

#### Start the FastAPI application using Uvicorn:

Recommended command for development (includes auto-reload)
uvicorn back.main:app --reload --host 0.0.0.0 --port 8000

Basic command without auto-reload
uvicorn back.main:app --host <API_HOST> --port <API_PORT>


Replace `<API_HOST>` and `<API_PORT>` if you changed them from the defaults (0.0.0.0 and 8000).

The `--reload` flag automatically restarts the server when code changes are detected (useful during development).

Once running, the API will be accessible at `http://<API_HOST>:<API_PORT>`.

## API Endpoints

*   **Root:** `GET /` - Basic API information and links.
*   **API Docs (Swagger):** `GET /docs` - Interactive API documentation.
*   **API Docs (ReDoc):** `GET /redoc` - Alternative API documentation.

### HIBP Checker (`/hibp`)

*   **Check Password:** `GET /hibp/check-password/?password={your_password}` - Checks if the provided password is pwned.
*   **Health Check:** `GET /hibp/health` - Checks if the HIBP checker service is initialized correctly.
*   **Info:** `GET /hibp/` - Shows HIBP configuration details.

### Ollama Analyzer (`/ollama`)

*   **Analyze Password:** `POST /ollama/generateContent` - Sends a password prompt (in the specified JSON request body format) to Ollama for analysis.
*   **Health Check:** `GET /ollama/health` - Checks connectivity to the configured Ollama service.
*   **Info:** `GET /ollama/` - Shows Ollama configuration details.

(Refer to the `/docs` endpoint for detailed request/response schemas.)
