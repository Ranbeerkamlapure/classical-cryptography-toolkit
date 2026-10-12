# Classical Cryptography Toolkit

> **Design and Development of a Classical Cryptography Toolkit**  
> *Course:* Network Security  
> *Academic Level:* Final Year Electronics and Computer Engineering (2026–27)

A modular, full-stack, menu-driven educational application implementing eight classical encryption and decryption algorithms, side-by-side performance benchmarking, containerized text-file encryption/decryption, and cryptographic theory guides.

---

## 🌟 Key Features

1. **8 Classical Cryptographic Ciphers:**
   - **Substitution Ciphers:** Caesar Cipher, Monoalphabetic Substitution Cipher, Playfair Cipher (5×5 Matrix), Hill Cipher (2×2 Matrix mod 26).
   - **Polyalphabetic Substitution:** Vigenère Cipher, One-Time Pad (Information-Theoretically Secure Random Pad).
   - **Transposition Ciphers:** Rail Fence Cipher (Zigzag Transposition), Columnar Transposition Cipher (Irregular Grid Permutations).
2. **Interactive Cryptography Workspace:**
   - Dynamic parameter inputs (integers, keywords, random alphabet generator, 2×2 matrix inputs with real-time determinant check).
   - Instant bi-directional encryption and decryption.
   - "Swap to Input" button for round-trip verification.
   - Clipboard integration and execution telemetry (time in milliseconds).
3. **Multi-Algorithm Comparison Module:**
   - Compare two or more algorithms on the same plaintext simultaneously.
   - High-resolution timing benchmarks (`time.perf_counter()`).
   - Comparison table displaying output length, execution time, and ciphertext previews.
4. **Text-File Processing:**
   - Encrypt plain-text `.txt` files (up to 1 MB) into a standardized `.enc.txt` format with non-secret metadata headers.
   - Decrypt compatible container files back into plaintext.
   - In-memory execution with zero persistent server storage.
5. **Interactive Help & Theory Guide:**
   - Comprehensive documentation for each cipher with worked examples matching implementation logic.
   - Searchable Cryptographic Glossary (Plaintext, Ciphertext, Keys, Substitution, Transposition, etc.).
6. **Academic About Section:**
   - Project overview, system architecture, taxonomy comparisons, and course details.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite 5, JavaScript (ES6+), Vanilla CSS (responsive dark navy cybersecurity theme).
- **Backend:** Python 3.13, Flask 3.1 REST API, Flask-CORS, Werkzeug.
- **Testing:** pytest 9.1 (40 automated unit and integration tests).
- **No Third-Party Cloud or DB:** Completely self-contained, runs locally on Windows without external databases, paid APIs, or cloud services.

---

## 📂 Project Directory Structure

```
classical-cryptography-toolkit/
├── backend/
│   ├── app.py                 # Flask REST API server and routes
│   ├── ciphers.py             # 8 classical cipher implementations
│   ├── file_service.py        # File packaging, headers, and parsing
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── package.json           # Node/React dependencies and scripts
│   ├── vite.config.js         # Vite configuration with API proxy
│   ├── index.html             # HTML entry point
│   └── src/
│       ├── main.jsx           # React DOM root
│       ├── App.jsx            # Application layout and view router
│       ├── api.js             # Fetch API client
│       ├── styles.css         # Dark theme cybersecurity styles
│       └── components/
│           ├── Header.jsx
│           ├── Navigation.jsx
│           ├── CipherWorkspace.jsx
│           ├── AlgorithmComparison.jsx
│           ├── FileTools.jsx
│           ├── HelpGuide.jsx
│           └── About.jsx
├── tests/
│   ├── test_ciphers.py        # Unit tests for all 8 ciphers and edge cases
│   └── test_api.py            # API endpoint integration tests
├── docs/
│   ├── report.md              # 13-section college mini project report
│   ├── user_manual.md         # Detailed user manual and walkthrough
│   ├── flowchart.md           # Mermaid system flowchart
│   └── presentation_outline.md# 6-slide outline and 5-min video script
├── sample_files/
│   └── sample_plaintext.txt   # Sample file for file encryption
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart & Execution (Windows PowerShell)

### 1. Prerequisites
Ensure Python (3.10+) and Node.js (18+) are installed:
```powershell
python --version
node --version
npm --version
```

### 2. Install Dependencies

In the project root directory:

**Backend Dependencies:**
```powershell
python -m pip install -r backend/requirements.txt
```

**Frontend Dependencies:**
```powershell
cd frontend
npm install
cd ..
```

### 3. Run the Application

Open **two separate PowerShell terminals**:

#### Terminal 1 — Start the Flask Backend (Port 5000):
```powershell
cd "c:\Users\RANBEER KAMLAPURE\.gemini\antigravity\scratch\Ranbeers portfolio"
python backend/app.py
```
*API runs at: `http://127.0.0.1:5000`*

#### Terminal 2 — Start the Vite Frontend (Port 5173):
```powershell
cd "c:\Users\RANBEER KAMLAPURE\.gemini\antigravity\scratch\Ranbeers portfolio\frontend"
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

Open your browser and visit: **`http://localhost:5173`**

---

## 🧪 Automated Testing

Execute the backend test suite:
```powershell
python -m pytest tests -v
```
*Output: **40 passed in ~0.44s***

Verify frontend production build:
```powershell
cd frontend
npm run build
cd ..
```
*Output: **built in ~1.13s***

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check probe and system status |
| `GET` | `/api/algorithms` | Metadata catalog for all 8 ciphers |
| `POST` | `/api/generate-key` | Generate keys for Monoalphabetic and OTP |
| `POST` | `/api/encrypt` | Encrypt text with specified cipher and key |
| `POST` | `/api/decrypt` | Decrypt ciphertext with specified cipher and key |
| `POST` | `/api/compare` | Benchmark 2+ ciphers on input message |
| `POST` | `/api/files/encrypt` | Encrypt uploaded file into container format |
| `POST` | `/api/files/decrypt` | Decrypt container or raw file |

---

## ⚠️ Educational Disclaimer

This toolkit was created for academic and pedagogical purposes for the **Network Security** course. Classical ciphers are vulnerable to frequency analysis, Kasiski tests, and modern brute-force cryptanalysis. **Do not use classical ciphers to protect real-world sensitive, financial, or personal data.**
