# Password Haven

<p align="center">
  <img src="https://images.icon-icons.com/2248/PNG/512/shield_key_icon_136217.png" alt="Password Haven Logo" width="120" />
</p>

<p align="center">
  <strong>An Intelligent AI-Powered Password Strength Analyzer</strong>
</p>

<p align="center">
  <a href="#key-features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#ml-capabilities">ML Capabilities</a> •
  <a href="#security-considerations">Security</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

Password Haven is a sophisticated tool that analyzes password strength using a combination of traditional metrics, breach data checks, and generative AI insights. It provides users with a comprehensive understanding of their password's security and offers intelligent suggestions for improvement, prioritizing privacy through local analysis.


> [!WARNING]
> **Disclaimer:** Using password cracking tools like Hashcat requires significant computational resources and has ethical and legal implications. **Only use the Hashcat feature on hashes you have explicit permission to test.** Ensure compliance with all applicable laws and policies.


## Key Features

*   🧠 **AI-Powered Analysis:** Leverages GenAI (via Ollama) to provide intelligent, context-aware password strength assessment beyond simple rule-checking.
*   ⏱️ **Time-to-Crack Estimation:** Calculates estimated cracking time based on common algorithms and various hardware capabilities (CPU, GPU).
*   🔍 **Breach Detection (HIBP):** Securely checks passwords against the Have I Been Pwned (HIBP) database using an offline dataset and optional Bloom filter acceleration.
*   💥 **Hashcat Cracking:** Initiates dictionary attacks against provided hashes using a local Hashcat instance to test real-world crackability (requires user permission and ethical use).
*   🔒 **Privacy-First:** Core password analysis (entropy, patterns) is performed locally in the browser. Passwords are *never* stored or logged by the core analysis features. Hashes sent for cracking are processed locally by the backend and Hashcat.
*   🧮 **Machine Learning Models:** Analyzes patterns learned from large breach datasets (like RockYou) to identify common weaknesses using custom ML models.
*   💡 **Smart Suggestions:** Provides actionable, AI-generated recommendations tailored to the specific weaknesses of the analyzed password.
*   📊 **Comprehensive Metrics:** Displays password entropy, common pattern recognition (dates, sequences, dictionary words), and overall vulnerability assessment.
*   📚 **Educational Content:** Includes a dedicated section with security best practices and a detailed FAQ to educate users about password security.

## Architecture

Password Haven employs a modern tech stack featuring a React frontend interacting with a Python FastAPI backend. The backend interfaces with the Ollama AI model, the local HIBP database, and the local Hashcat executable.

### System Architecture

```text
┌──────────────────────┐     ┌───────────────────────────┐     ┌───────────────────┐
│                      │     │                           │     │                   │
│    React Frontend    │────►│      FastAPI Backend      │────►│  Ollama AI Model  │
│ (Local Analysis, UI) │     │ (API, HIBP, Hashcat Ctrl) │     │ (Local Inference) │
│                      │     │                           │     │                   │
└──────────────────────┘     └───────────────────────────┘     └───────────────────┘
         │                      │               │
         │                      │               │
         ▼                      ▼               ▼
┌──────────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                      │     │                   │     │                   │
│  Browser-Based Tools │     │   HIBP Breach     │     │ Hashcat Executable│
│ (Entropy, Patterns)  │     │   Database (Local)│     │ (Local Process)   │
│                      │     │                   │     │ + Wordlists       │
└──────────────────────┘     └───────────────────┘     └───────────────────┘
```
# Tech Stack

## Frontend:
- **React + TypeScript**
- **Vite** (Build System)
- **Tailwind CSS**
- **shadcn/ui** (Component Library)
- **React Router** (Navigation)
- **React Query** (API State Management)

## Backend:
- **Python 3.8+**
- **FastAPI** (Web Framework)
- **Uvicorn** (ASGI Server)
- **pwnedpasswords-offline** (Local HIBP checks)
- **Ollama Python Client** (AI Model Integration)
- **ML Libraries** (e.g., scikit-learn, potentially TensorFlow/PyTorch for advanced models)
- **Standard Libraries** subprocess, asyncio (for Hashcat interaction)

## AI & ML:
- **Ollama** for running local Large Language Models (LLMs) like Gemma, Llama, etc.
- Custom Machine Learning models trained on password datasets for vulnerability assessment.
- Techniques potentially include **N-grams**, **feature extraction**, and **transfer learning**.

## External Tools:
- **Hashcat** Local installation required for cracking functionality.

# Getting Started

## Prerequisites
- **Node.js:** v18 or later (includes npm). Alternatively, use Bun.
- **Python:** v3.8 or later.
- **Ollama:** Installed and running locally. ([ollama.com](https://ollama.com))
- **Hashcat** Installed locally. (hashcat.net) Ensure it's either in your system PATH or you know the full path to the executable.
- **HIBP Database File:** The Pwned Passwords ordered-by-hash text file. Download from [Have I Been Pwned Downloads](https://haveibeenpwned.com/Passwords).
- **Wordlist Files** Dictionary files (e.g., rockyou.txt) for Hashcat.
- **Git:** For cloning the repository.

## Installation

### 1. Clone the Repository:
```bash
git clone https://github.com/your-username/password-haven.git  # Replace with your repo URL
cd password-haven
```
### 2. Frontend Setup:
```bash
# Navigate to frontend directory if your structure has one, otherwise run from root
# cd frontend

# Install dependencies (choose one)
npm install
# or
bun install

# Optional: Copy environment variables template
# cp .env.example .env
# Edit .env if needed (e.g., VITE_API_URL if backend is not default)
```
### 3. Backend Setup:
```bash
# Navigate to backend directory
cd back

# Create and activate a virtual environment
python -m venv .venv
# On Linux/macOS:
source .venv/bin/activate
# On Windows:
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables template
cp .env.example .env

# Edit back/.env with your configuration:
# - HIBP_DATA_DIR (path to HIBP files)
# - HIBP_DATA_FILENAME (name of HIBP .txt file)
# - OLLAMA_HOST (if not default http://localhost:11434)
# - OLLAMA_MODEL (e.g., llama3, gemma:2b - must be pulled)
# - HASHCAT_PATH (ONLY if hashcat is NOT in your system PATH)
# - WORDLISTS_DIR (path to directory containing wordlists)
# - API_HOST, API_PORT, LOG_LEVEL (if changing defaults)

```
## 4. HIBP Data Setup:
- Create the directory specified by HIBP_DATA_DIR in back/.env (e.g., HIBP_data in the project root).

- Place the downloaded HIBP password file (the large .txt file ordered by hash) inside this directory.

- Ensure the filename matches HIBP_DATA_FILENAME in back/.env.

- **(Optional but Recommended)** Generate or download the corresponding .bloom filter file and place it in the same directory.

## 5. Wordlist Setup:
- Create the directory specified by WORDLISTS_DIR in back/.env (e.g., wordlists in the project root).

- Place your desired wordlist files (like rockyou.txt) inside this directory.

## 6. Ollama Setup:
- Ensure Ollama is installed and running.

- Pull the desired AI model specified in OLLAMA_MODEL in back/.env.

```bash ollama pull gemma:2b # Example: pull Gemma 2B model
# or
ollama pull llama3   # Example: pull Llama 3 model
```
## 7. Hashcat Check:
- Verify your Hashcat installation works independently.

- If Hashcat is not in your system's PATH, make sure you set the full path in HASHCAT_PATH in back/.env.

## Usage
### Starting the Application
#### Start the Backend Server:
```bash
# Ensure you are in the 'back' directory with the virtual environment activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
(The --reload flag enables auto-reloading during development)

#### Start the Frontend Development Server:
```bash
# Open a new terminal window/tab
# Navigate to the frontend directory (or project root if configured that way)

# Run the development server (choose one)
npm run dev
# or
bun run dev
Use code with caution.
```
### Access the Application

1.  Ensure the [Backend Server](#starting-the-application) and [Frontend Development Server](#starting-the-application) are running.
2.  Open your web browser and navigate to `http://localhost:5173` (or the port specified by Vite/Bun).

### Core Features Walkthrough

1.  **Password Analysis**:
    *   Enter any password into the main input field.
    *   The application immediately performs local analysis (calculating entropy, identifying basic patterns like sequences or repeats).
    *   It then queries the backend API to fetch:
        *   **AI Insights:** Analysis and suggestions from the configured Ollama model.
        *   **Machine Learning Score:** Strength prediction based on the trained ML model.
        *   **HIBP Check:** Verifies if the password hash exists in the offline Have I Been Pwned database.
        *   **Crack Time Estimation:** Estimated time to crack based on common algorithms (results may vary).

2.  **Hash Generation & Cracking (Use Responsibly!)**:
    *   Navigate to the dedicated Hashcat Cracking section in the UI.
    *   **Generate Hash:** Enter a plaintext password and select a hash type (e.g., MD5, SHA1, NTLM) to generate its corresponding hash.
    *   **Configure Attack:** Select one of the available wordlist files configured on the backend server.
    *   **Initiate Crack:**
        > **⚠️ Ethical Use Warning:** Click the "Crack Hash" button to send the *hash* (not the plaintext) and selected wordlist to the backend. The backend will use your local Hashcat installation to attempt a dictionary attack. **Only perform this on hashes you have explicit permission to test.** Ensure you comply with all applicable laws and ethical guidelines.

3.  **View Results**:
    *   Examine the comprehensive results panel which displays:
        *   Overall strength score and assessment.
        *   Calculated entropy.
        *   Estimated crack times (if applicable).
        *   Detected weaknesses (dictionary words, sequences, etc.).
        *   HIBP status (Pwned or Not Pwned).
        *   Feedback and suggestions from the AI model.
        *   Results from the Hashcat cracking attempt (Success/Failure, Cracked Password if found, Time Taken).

4.  **Educational Resources**:
    *   Explore the "Security Tips" and "FAQ" pages for best practices and detailed information about password security concepts.

## 🚀 Deployment

Deploying Password Haven involves building the frontend for production and running the backend server in a suitable environment.

### Production Build

#### Frontend

Run the build command from your frontend directory (or project root):

```bash
# Using npm
npm run build

# Using Bun
bun run build
```

This command optimizes and bundles your React application into static assets (HTML, CSS, JavaScript) located in the `dist` folder, ready for deployment on a static web host.

#### Backend

*   Ensure your `back/requirements.txt` lists the exact dependencies needed for production (consider pinning versions).
*   When running the backend in production, **do not** use the `--reload` flag with `uvicorn`.

### Frontend Deployment (Example: Vercel/Netlify)

Platforms like Vercel, Netlify, Cloudflare Pages, or similar static hosting services are ideal for the frontend:

1.  **Connect Git Repository:** Link your GitHub/GitLab/Bitbucket repository to the platform.
2.  **Configure Build Settings:**
    *   **Build Command:** Set it to `npm run build` or `bun run build`.
    *   **Output Directory:** Set it to `dist`.
3.  **Set Environment Variables:** Configure the `VITE_API_URL` environment variable on the platform to point to the **publicly accessible URL** of your deployed backend API (e.g., `https://api.yourdomain.com`).
4.  **Deploy!**

### Backend Deployment Options

Choose the method that best suits your infrastructure:

#### 🐳 Docker

(Assuming a `back/Dockerfile` is correctly configured)

1.  **Build the Docker Image:**
    ```bash
    # Run from the project root directory
    docker build -t password-haven-api -f back/Dockerfile .
    ```

2.  **Run the Docker Container:**
    ```bash
    docker run -d \
      --name password-haven-api \
      -p 8000:8000 \
      --restart unless-stopped \
      -v /your/local/path/to/HIBP_data:/app/HIBP_data:ro \ # Mount HIBP data (read-only recommended)
      -v /your/local/path/to/wordlists:/app/wordlists:ro \ # Mount wordlists (read-only recommended)
      -e API_HOST="0.0.0.0" \
      -e API_PORT="8000" \
      -e LOG_LEVEL="INFO" \
      -e OLLAMA_HOST="http://<ollama_host_ip_or_hostname>:11434" \ # Accessible Ollama instance
      -e OLLAMA_MODEL="gemma:2b" \                             # Or your chosen model
      -e HIBP_DATA_DIR="/app/HIBP_data" \
      -e HIBP_DATA_FILENAME="your-hibp-file.txt" \
      -e WORDLISTS_DIR="/app/wordlists" \
      # Optional: Only set if hashcat isn't in PATH inside the container
      # -e HASHCAT_PATH="/path/to/hashcat/inside/container" \
      password-haven-api
    ```

    > **Notes:**
    > *   Replace `/your/local/path/to/...` with the *actual absolute paths* on your host machine where the HIBP data and wordlists reside.
    > *   Ensure the container can reach the `OLLAMA_HOST`. This might be a private IP if running Ollama on the same network/machine, or a service name in Docker Compose/Kubernetes.
    > *   Make sure the `HIBP_DATA_FILENAME` matches the file you mounted.
    > *   Ensure the `HASHCAT_PATH` (if needed) points to the correct location *inside* the container. If Hashcat is installed via the Dockerfile and added to the PATH, you likely don't need this environment variable.

#### ☸️ Kubernetes

*   Utilize Kubernetes manifests (e.g., Deployment, Service, PersistentVolumeClaim, ConfigMap, Secret) typically located in a `deployment/k8s/` directory (if provided).
*   You'll need PersistentVolumes for `HIBP_data` and `wordlists`.
*   Configure environment variables using ConfigMaps and Secrets.
*   Expose the service, potentially via an Ingress controller.

#### ⚙️ Server/Virtual Machine

1.  Ensure Python, your virtual environment, and all dependencies from `requirements.txt` are installed.
2.  Ensure Hashcat and Ollama (with the required model pulled) are installed and accessible.
3.  Place HIBP data and wordlists in appropriate directories.
4.  Set the required environment variables (see below).
5.  Run the FastAPI application using a production-grade ASGI server like Uvicorn managed by Gunicorn, supervised by `systemd` or `supervisor` for reliability.

    ```bash
    # Example: Run with Gunicorn managing Uvicorn workers
    # (Ensure virtual environment is activated)
    gunicorn back.main:app \
      --workers 4 \ # Adjust based on CPU cores
      --worker-class uvicorn.workers.UvicornWorker \
      --bind 0.0.0.0:8000 \
      --log-level info
    ```

### Environment Variables (Production)

**Crucial for backend deployment:**

> **🔒 Security Best Practice:** **NEVER** commit your `.env` file containing production secrets or paths to version control (Git). Use your deployment environment's mechanism for setting environment variables securely (e.g., Docker `-e` flags, Kubernetes Secrets/ConfigMaps, system environment variables, platform-specific settings).

*   **Frontend:**
    *   `VITE_API_URL`: The public URL of your deployed backend API.
*   **Backend:** Set *all* required variables from your `back/.env.example` (or `back/.env` if you created one locally for development, but **don't commit it**). Pay special attention to:
    *   `HIBP_DATA_DIR`, `HIBP_DATA_FILENAME`
    *   `WORDLISTS_DIR`
    *   `OLLAMA_HOST`, `OLLAMA_MODEL`
    *   `HASHCAT_PATH` (Only if Hashcat is not in the system PATH of the deployment environment)
    *   `API_HOST`, `API_PORT`, `LOG_LEVEL`

## 🧠 ML Capabilities

Password Haven incorporates Machine Learning (primarily on the backend) to enhance its analysis beyond standard checks:

*   **N-gram Analysis:** Models learn common character/keyboard patterns from datasets like RockYou to identify predictable sequences often found in weak passwords.
*   **Feature-Based Classification:** A pre-trained classifier (e.g., LightGBM) uses extracted password features (length, character types, pattern presence) to predict the likelihood of vulnerability, often correlating with zxcvbn scores but trained on real-world data patterns.
*   **(Potential) Time-to-Crack Prediction:** While the current implementation might use standard estimates, ML regression models *could* be trained on cracking benchmarks for more nuanced time predictions.
*   **(Potential) Transfer Learning:** Future versions *could* leverage pre-trained language models fine-tuned on password data to understand deeper structural weaknesses.

## 🛡️ Security Considerations

*   **Password Privacy:** Passwords entered for analysis are processed locally in the browser (for basic checks) or sent *only* to your self-hosted backend/Ollama instance. **They are NOT stored or logged by the application.**
*   **Hash Privacy:** Hashes generated for cracking simulation are sent *only* to your self-hosted backend, which interacts with your local Hashcat instance. They are not sent to external services.
*   **HIBP Offline Check:** Using the offline HIBP dataset ensures your passwords/hashes are never sent to the HIBP service directly, maintaining privacy.
*   **Hashcat Locality & Ethics:** Cracking attempts run entirely on the server hosting the backend and Hashcat. **Ethical use is paramount.** Only test hashes you own or have explicit permission for.
*   **API Security:** For public deployments, implement standard API security: HTTPS, rate limiting, input validation, and potentially API keys or authentication.
*   **Ollama Isolation:** AI analysis runs locally via Ollama, preventing password data leakage to third-party cloud AI providers.
*   **Stateless Design:** The application is designed to be stateless regarding user passwords and hashes beyond the immediate processing of a single request.

## 🤝 Contributing

Contributions are welcome! Please refer to the `CONTRIBUTING.md` file (if available) for guidelines on reporting issues, suggesting features, and submitting pull requests.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for full details.

## 🙏 Acknowledgements

*   **Have I Been Pwned:** For the invaluable Pwned Passwords dataset.
*   **Ollama:** For enabling powerful local AI model execution.
*   **Hashcat:** For the industry-standard password recovery tool.
*   **shadcn/ui:** For the fantastic UI components.
*   The developers of React, FastAPI, Tailwind CSS, Vite, LightGBM, zxcvbn, and all the other open-source libraries that made this project possible.

---

Created by **Aditya Verma**