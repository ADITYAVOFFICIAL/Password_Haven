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

## Key Features

*   🧠 **AI-Powered Analysis:** Leverages GenAI (via Ollama) to provide intelligent, context-aware password strength assessment beyond simple rule-checking.
*   ⏱️ **Time-to-Crack Estimation:** Calculates estimated cracking time based on common algorithms and various hardware capabilities (CPU, GPU).
*   🔍 **Breach Detection:** Securely checks passwords against the Have I Been Pwned (HIBP) database using k-anonymity to protect user privacy.
*   🔒 **Privacy-First:** Core password analysis (entropy, patterns) is performed locally in the browser. Passwords are *never* stored or logged.
*   🧮 **Machine Learning Models:** Analyzes patterns learned from large breach datasets (like RockYou) to identify common weaknesses using custom ML models.
*   💡 **Smart Suggestions:** Provides actionable, AI-generated recommendations tailored to the specific weaknesses of the analyzed password.
*   📊 **Comprehensive Metrics:** Displays password entropy, common pattern recognition (dates, sequences, dictionary words), and overall vulnerability assessment.
*   📚 **Educational Content:** Includes a dedicated section with security best practices and a detailed FAQ to educate users about password security.

## Architecture

Password Haven employs a modern tech stack featuring a React frontend interacting with a Python FastAPI backend, which interfaces with the Ollama AI model and the HIBP database.

### System Architecture

```text
┌──────────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│                      │     │                  │     │                   │
│    React Frontend    │────►│  FastAPI Backend │────►│  Ollama AI Model  │
│ (Local Analysis)     │     │ (API, HIBP Check)│     │ (Local Inference) │
│                      │     │                  │     │                   │
└──────────────────────┘     └──────────────────┘     └───────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌──────────────────────┐     ┌───────────────────┐
│                      │     │                   │
│  Browser-Based Tools │     │   HIBP Breach     │
│ (Entropy, Patterns)  │     │   Database (Local)│
│                      │     │                   │
└──────────────────────┘     └───────────────────┘
```
Use code with caution.
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

## AI & ML:
- **Ollama** for running local Large Language Models (LLMs) like Gemma, Llama, etc.
- Custom Machine Learning models trained on password datasets for vulnerability assessment.
- Techniques potentially include **N-grams**, **feature extraction**, and **transfer learning**.

# Getting Started

## Prerequisites
- **Node.js:** v18 or later (includes npm). Alternatively, use Bun.
- **Python:** v3.8 or later.
- **Ollama:** Installed and running locally. ([ollama.com](https://ollama.com))
- **HIBP Database File:** The Pwned Passwords ordered-by-hash text file. Download from [Have I Been Pwned Downloads](https://haveibeenpwned.com/Passwords).
- **Git:** For cloning the repository.

# Installation

## Clone the Repository:
```bash
git clone https://github.com/your-username/password-haven.git  # Replace with your repo URL
cd password-haven
```
Use code with caution.
Bash
Frontend Setup:

# Navigate to frontend directory if your structure has one, otherwise run from root
# cd frontend

# Install dependencies (choose one)
npm install
# or
bun install

# Optional: Copy environment variables template
# cp .env.example .env
# Edit .env if needed (e.g., VITE_API_URL if backend is not default)
Use code with caution.
Bash
Backend Setup:

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
# - HIBP_DATA_DIR (path relative to the backend directory or absolute path)
# - OLLAMA_HOST (if not default http://localhost:11434)
# - OLLAMA_MODEL (e.g., llama3, gemma:2b - must be pulled)
Use code with caution.
Bash
HIBP Data Setup:

Create a directory to store the HIBP data (e.g., HIBP_data in the project root or inside the back directory).

Place the downloaded HIBP password file (the large .txt file ordered by hash) inside this directory.

Update the HIBP_DATA_DIR variable in back/.env to point to this directory.

Optional but Recommended: Generate or download the corresponding .bloom filter file for faster lookups and place it in the same directory.

Ollama Setup:

Ensure Ollama is installed and running.

Pull the desired AI model. Make sure the model name matches OLLAMA_MODEL in back/.env.

ollama pull gemma:2b # Example: pull Gemma 2B model
# or
ollama pull llama3   # Example: pull Llama 3 model
Use code with caution.
Bash
Usage
Starting the Application
Start the Backend Server:

# Ensure you are in the 'back' directory with the virtual environment activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
Use code with caution.
Bash
(The --reload flag enables auto-reloading during development)

Start the Frontend Development Server:

# Open a new terminal window/tab
# Navigate to the frontend directory (or project root if configured that way)

# Run the development server (choose one)
npm run dev
# or
bun run dev
Use code with caution.
Bash
Access the Application:
Open your web browser and navigate to http://localhost:5173 (or the port specified by Vite/Bun).

Core Features Walkthrough
Password Analysis: Enter any password into the input field. The application will immediately perform local analysis (entropy, basic patterns) and then query the backend for AI insights, crack time estimation, and breach checks.

View Results: Examine the detailed breakdown including:

Overall strength score/rating.

Estimated time to crack on different hardware tiers.

Entropy value.

Detected weaknesses (e.g., dictionary words, sequences, dates).

HIBP breach check result (using k-anonymity).

AI Recommendations: Read the AI-generated feedback explaining the password's vulnerabilities and suggestions for creating a stronger, unique password.

Educational Resources: Navigate to the "Security Tips" or "FAQ" sections (if available) to learn more about password security best practices.

Deployment
Production Build
Frontend:

# From the frontend directory (or project root)
npm run build
# or
bun run build
Use code with caution.
Bash
This will create a dist folder (or similar) with optimized static assets.

Backend: Ensure all dependencies in requirements.txt are suitable for production.

Frontend Deployment (Example: Vercel)
Password Haven's frontend is well-suited for static hosting platforms like Vercel, Netlify, or GitHub Pages.

Connect your Git repository to Vercel.

Configure the build command (e.g., npm run build or bun run build).

Set the output directory (e.g., dist).

Set the necessary environment variables (like VITE_API_URL pointing to your deployed backend).

Deploy!

Backend Deployment Options
Docker: A Dockerfile is likely provided in the back directory.

# From the project root (adjust path to Dockerfile if needed)
docker build -t password-haven-api -f back/Dockerfile .

# Run the container
docker run -d -p 8000:8000 \
  --name password-haven-api \
  -v /path/to/your/HIBP_data:/app/HIBP_data \ # Mount HIBP data
  -e OLLAMA_HOST="http://<ollama_host_ip>:11434" \ # Point to accessible Ollama instance
  -e HIBP_DATA_DIR="/app/HIBP_data" \ # Path inside the container
  -e OLLAMA_MODEL="gemma:2b" \ # Ensure model is set
  password-haven-api
Use code with caution.
Bash
Note: Ensure the Ollama service is accessible from the Docker container (e.g., running on the host or another container on the same network).

Kubernetes: Configuration files might be available in a deployment/k8s/ directory (refer to those specific files for details). This typically involves creating Deployments, Services, and potentially Ingress resources.

Server/VM: You can run the FastAPI application directly using a production-grade ASGI server like Uvicorn managed by a process manager like systemd or supervisor.

# Example using Uvicorn with multiple workers
# Ensure virtual environment is activated and dependencies installed
uvicorn back.main:app --host 0.0.0.0 --port 8000 --workers 4
Use code with caution.
Bash
Environment Variables
Frontend (.env or platform-specific config):

VITE_API_URL: Required. The URL of the deployed backend API (e.g., https://api.yourdomain.com).

VITE_GEMINI_API_KEY: Optional. If integrating Google Gemini directly in the frontend (usually not recommended for API keys).

Backend (back/.env or system environment variables):

API_HOST: Host for the backend server (default: 0.0.0.0).

API_PORT: Port for the backend server (default: 8000).

HIBP_DATA_DIR: Required. Path to the directory containing HIBP data files.

OLLAMA_HOST: Required. URL of the running Ollama API service (default: http://localhost:11434).

OLLAMA_MODEL: Required. Name of the Ollama model to use (e.g., gemma:2b, llama3).

ML Capabilities
Password Haven incorporates Machine Learning to enhance its analysis:

N-gram Character/Pattern Analysis: Models trained on datasets like RockYou learn common sequences, keyboard patterns, and character frequencies found in weak passwords.

Feature-Based Classification: Extracts features from passwords (length, character types, dictionary word presence, common patterns) to train classifiers (e.g., SVM, Random Forest) predicting vulnerability likelihood.

Time-to-Crack Prediction: Potentially uses regression models trained on password cracking benchmarks to estimate crack times more accurately than simple entropy calculations.

Transfer Learning: May leverage pre-trained language or sequence models, fine-tuned on password datasets, to understand deeper structural weaknesses.

These ML components primarily run on the backend to leverage Python's data science ecosystem.

Security Considerations
Security and privacy are paramount in Password Haven:

Password Privacy: Passwords entered by the user are primarily processed locally in the browser. They are NOT stored, logged, or persisted anywhere.

HIBP K-Anonymity: The check against the Have I Been Pwned database uses the official k-anonymity model. Only the first 5 characters of the SHA-1 hash of the password are sent to the backend (and potentially onward to the HIBP API if not using the offline check fully), preventing exposure of the full password hash. The offline check keeps everything local.

API Security: The backend API should implement standard security practices like rate limiting, input validation, and potentially authentication if extended.

Ollama Isolation: By using Ollama, AI analysis runs locally, preventing password data from being sent to third-party cloud AI providers. The password is sent from the backend to the local Ollama instance.

No Data Persistence: The application is designed to be stateless regarding user passwords.

Contributing
Contributions are welcome! If you'd like to help improve Password Haven, please refer to the CONTRIBUTING.md file for guidelines on reporting issues, suggesting features, and submitting pull requests.

License
This project is licensed under the MIT License. See the LICENSE file for full details.

Acknowledgements
Have I Been Pwned: For providing the invaluable Pwned Passwords dataset.

Ollama: For enabling powerful local AI model execution.

shadcn/ui: For the fantastic UI components used in the frontend.

The developers of React, FastAPI, Tailwind CSS, and other open-source libraries used in this project.

Created by Aditya Verma