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
Access the Application:
Open your web browser and navigate to http://localhost:5173 (or the port specified by Vite/Bun).

Core Features Walkthrough
Password Analysis: Enter any password into the input field. The application performs local analysis (entropy, basic patterns) and queries the backend for AI insights, HIBP checks, and potentially crack time estimation.

Hash Generation & Cracking: Use the dedicated UI section to:

Enter plaintext and select a hash type (MD5, SHA1, etc.) to generate a hash.

Select a wordlist available on the server.

Initiate a cracking attempt against the generated hash using Hashcat via the backend. Use responsibly and ethically.

View Results: Examine the detailed breakdown including strength scores, crack times, entropy, detected weaknesses, HIBP status, AI feedback, and Hashcat results (if applicable).

Educational Resources: Navigate to the "Security Tips" or "FAQ" sections to learn more about password security.

Deployment
Production Build
Frontend:

# From the frontend directory (or project root)
npm run build
# or
bun run build
Use code with caution.
Bash
This creates a dist folder with optimized static assets.

Backend: Ensure dependencies in requirements.txt are suitable for production. Remove --reload flag from Uvicorn command.

Frontend Deployment (Example: Vercel)
Connect your Git repository to Vercel/Netlify/etc.

Configure build command (e.g., npm run build).

Set output directory (e.g., dist).

Set environment variables (like VITE_API_URL pointing to your deployed backend).

Deploy!

Backend Deployment Options
Docker: (Assuming a back/Dockerfile exists)

# From the project root
docker build -t password-haven-api -f back/Dockerfile .

# Run the container (adjust volumes and env vars)
docker run -d -p 8000:8000 \
  --name password-haven-api \
  -v /path/to/your/HIBP_data:/app/HIBP_data \ # Mount HIBP data
  -v /path/to/your/wordlists:/app/wordlists \ # Mount wordlists
  -e OLLAMA_HOST="http://<ollama_host_ip>:11434" \ # Point to accessible Ollama
  -e HIBP_DATA_DIR="/app/HIBP_data" \
  -e WORDLISTS_DIR="/app/wordlists" \
  -e OLLAMA_MODEL="gemma:2b" \
  # -e HASHCAT_PATH="/path/inside/container/if/needed" \ # Only if not in PATH within container
  password-haven-api
Use code with caution.
Bash
Note: Ensure Ollama and potentially Hashcat (if not baked into image) are accessible from the container.

Kubernetes: Use deployment manifests (likely in deployment/k8s/) involving Deployments, Services, PersistentVolumes (for data), and potentially Ingress.

Server/VM: Run FastAPI using a production ASGI server like Uvicorn with Gunicorn workers, managed by systemd or supervisor.

# Example using Uvicorn with Gunicorn
# Ensure virtual env activated, dependencies installed
gunicorn back.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Use code with caution.
Bash
Environment Variables (Production)
Frontend: VITE_API_URL (URL of deployed backend).

Backend: Set all required variables from back/.env (especially data paths, Ollama host, potentially HASHCAT_PATH) in the production environment (system variables, Docker -e flags, K8s secrets/configmaps). Do not commit sensitive .env files.

ML Capabilities
Password Haven incorporates Machine Learning to enhance its analysis:

N-gram Character/Pattern Analysis: Models trained on datasets like RockYou learn common sequences, keyboard patterns, and character frequencies found in weak passwords.

Feature-Based Classification: Extracts features from passwords (length, character types, dictionary word presence, common patterns) to train classifiers (e.g., SVM, Random Forest) predicting vulnerability likelihood.

Time-to-Crack Prediction: Potentially uses regression models trained on password cracking benchmarks to estimate crack times more accurately than simple entropy calculations.

Transfer Learning: May leverage pre-trained language or sequence models, fine-tuned on password datasets, to understand deeper structural weaknesses.

These ML components primarily run on the backend to leverage Python's data science ecosystem.

Security Considerations
Password Privacy: Passwords for analysis are primarily processed locally in the browser or sent to the local backend/Ollama instance. They are NOT stored or logged. Hashes for cracking are processed by the local backend and Hashcat.

HIBP K-Anonymity / Offline: The offline check keeps HIBP lookups entirely local. If ever adapted to use the online API, k-anonymity must be maintained.

Hashcat Locality: Cracking attempts run entirely on the server hosting the backend and Hashcat. No hashes are sent to external services for cracking. Ethical use is paramount.

API Security: Implement standard practices: rate limiting, input validation, HTTPS, potentially authentication if deployed publicly.

Ollama Isolation: AI analysis runs locally via Ollama, preventing data leakage to third-party cloud AI providers.

No Data Persistence: The application is designed to be stateless regarding user passwords/hashes beyond the immediate request processing.

Contributing
Contributions are welcome! Please refer to the CONTRIBUTING.md file (if available) for guidelines on reporting issues, suggesting features, and submitting pull requests.

License
This project is licensed under the MIT License. See the LICENSE file for full details.

Acknowledgements
Have I Been Pwned: For providing the invaluable Pwned Passwords dataset.

Ollama: For enabling powerful local AI model execution.

Hashcat: For the gold-standard password recovery tool.

shadcn/ui: For the fantastic UI components used in the frontend.

The developers of React, FastAPI, Tailwind CSS, and other open-source libraries used in this project.

Created by Aditya Verma