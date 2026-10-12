# Classical Cryptography Toolkit — User Manual

**Course:** Network Security  
**Academic Year:** Final Year Electronics & Computer Engineering (2026–27)  
**Target Environment:** Local Windows Workstation (PowerShell)  

---

## 1. Project Overview

The **Classical Cryptography Toolkit** is an interactive, responsive web application designed for students and educators in Network Security. It provides a laboratory environment to explore, encrypt, decrypt, benchmark, and process text files across eight classical cryptographic algorithms:

1. **Caesar Cipher** (Monoalphabetic Shift)
2. **Monoalphabetic Substitution Cipher** (26-letter Permuted Alphabet)
3. **Playfair Cipher** (5×5 Matrix Digraph Substitution)
4. **Hill Cipher** (2×2 Matrix Linear Transformation mod 26)
5. **Vigenère Cipher** (Polyalphabetic Stream Substitution)
6. **One-Time Pad** (Information-Theoretically Secure Random Pad)
7. **Rail Fence Cipher** (Zigzag Transposition)
8. **Columnar Transposition Cipher** (Permutation Grid Transposition)

---

## 2. System Prerequisites

Before running the application on Windows, verify that the following runtime environments are installed:

- **Python:** Version 3.10 or newer (tested with Python 3.13)
- **Node.js:** Version 18.0 or newer (tested with Node v22.14)
- **npm:** Version 9.0 or newer (tested with npm 10.9)
- **PowerShell:** Windows PowerShell 5.1 or PowerShell Core 7+

Verify installations in PowerShell:
```powershell
python --version
node --version
npm --version
```

---

## 3. Installation & Setup Instructions

### Step 3.1: Navigate to Workspace Root
Open a Windows PowerShell terminal and navigate to the project directory:
```powershell
cd "c:\Users\RANBEER KAMLAPURE\.gemini\antigravity\scratch\Ranbeers portfolio"
```

### Step 3.2: Python Backend Environment Setup
Install the required backend packages:
```powershell
python -m pip install -r backend/requirements.txt
```
*(Packages installed: `flask`, `flask-cors`, `pytest`, `werkzeug`)*

### Step 3.3: Frontend Dependencies Setup
Install npm packages in the `frontend` folder:
```powershell
cd frontend
npm install
cd ..
```

---

## 4. Starting the Application

The toolkit requires running both the Flask REST API backend and the Vite frontend. Use two separate PowerShell windows:

### Terminal 1: Run the Backend API (Port 5000)
```powershell
cd "c:\Users\RANBEER KAMLAPURE\.gemini\antigravity\scratch\Ranbeers portfolio"
python backend/app.py
```
*Expected Output:*
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### Terminal 2: Run the Frontend Development Server (Port 5173)
```powershell
cd "c:\Users\RANBEER KAMLAPURE\.gemini\antigravity\scratch\Ranbeers portfolio\frontend"
npm run dev
```
*Expected Output:*
```
  VITE v5.4.11  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 5. User Operations & Features Guide

### 5.1 Encrypt / Decrypt Workspace

1. **Select Cipher:** Use the dropdown menu in the top card to pick one of the 8 ciphers.
2. **Enter or Generate Key:**
   - **Caesar:** Enter an integer shift (e.g., `3`, `-5`, `29`).
   - **Monoalphabetic:** Enter a 26-letter substitution alphabet or click **Generate Valid Key**.
   - **Playfair:** Enter an alphabetic keyword (e.g., `MONARCHY`).
   - **Hill:** Enter four integers into the 2×2 grid. The interface displays real-time determinant values and validates whether $\gcd(\det, 26) = 1$.
   - **Vigenère:** Enter an alphabetic keyword (e.g., `CIPHER`).
   - **One-Time Pad:** Leave blank during encryption to auto-generate a cryptographically random key matching message length, or input an existing key for decryption.
   - **Rail Fence:** Enter the number of rails (integer $\ge 2$).
   - **Columnar Transposition:** Enter an alphabetic keyword (e.g., `GERMAN`).
3. **Execute:**
   - Click **Encrypt Text** to produce ciphertext.
   - Click **Decrypt Text** to recover plaintext.
   - Click **Swap to Input** to immediately transfer the ciphertext to the input area and test reverse decryption.
   - Click **Copy Output** or **Copy Key** to copy values to the system clipboard.

---

### 5.2 Compare Algorithms Module

1. Click the **Compare Algorithms** tab in the navigation bar.
2. Enter a benchmark message in the text area.
3. Check two or more ciphers to compare.
4. Adjust or customize the keys for each selected cipher if desired.
5. Click **Execute Comparative Analysis**.
6. The resulting table displays:
   - Cipher name & taxonomy category.
   - Success/Failure status.
   - Ciphertext output length.
   - Measured execution time (in milliseconds using `time.perf_counter()`).
   - Ciphertext preview.

---

### 5.3 Text-File Encryption and Decryption

1. Click the **File Encryption** tab.
2. Select **File Encrypt** or **File Decrypt** mode.
3. Select the desired algorithm and enter the required key parameter.
4. Click the upload drop area and choose a plain-text file (`.txt`, maximum size 1 MB). A sample file is available at `sample_files/sample_plaintext.txt`.
5. Click **Encrypt & Format File** (or **Decrypt File**).
6. Click **Download Result** to save the output file:
   - Encrypted files are packaged into a documented `.enc.txt` format with tamper-evident metadata headers.
   - Decrypted files restore the original plaintext.

---

### 5.4 Help / Algorithm Guide & About Sections

- **Help / Algorithm Guide:** Browse detailed explanations, worked examples, key rules, and cryptanalytic limitations for all eight ciphers. Use the search bar to locate specific terms or view the interactive Cryptography Glossary.
- **About Project:** Review academic details, course information, student placeholders, theoretical classifications, and system architecture.

---

## 6. Running Automated Tests

Run the backend test suite from the project root using `pytest`:
```powershell
cd "c:\Users\RANBEER KAMLAPURE\.gemini\antigravity\scratch\Ranbeers portfolio"
python -m pytest tests -v
```

*Expected Result:*
```
============================= 40 passed in 0.44s ==============================
```

To verify the frontend build:
```powershell
cd "c:\Users\RANBEER KAMLAPURE\.gemini\antigravity\scratch\Ranbeers portfolio\frontend"
npm run build
```
*Expected Result:*
```
✓ built in 1.13s (dist folder generated)
```

---

## 7. Troubleshooting & Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Backend: Disconnected" alert banner in browser** | Flask API server is not running on port 5000. | Start `python backend/app.py` in PowerShell. Ensure port 5000 is not blocked. |
| **Hill Cipher: "Matrix is not invertible modulo 26"** | Matrix determinant shares a common factor with 26 ($\gcd \ne 1$). | Ensure matrix determinant is odd and not divisible by 13 (e.g. use default `[[9,4],[5,7]]`). |
| **Monoalphabetic: "Key must contain each letter exactly once"** | Entered alphabet has fewer than 26 characters or contains duplicates. | Click **Generate Valid Key** or enter a 26-letter permutation of A–Z. |
| **One-Time Pad: "Key length does not match"** | The entered OTP key has fewer or more letters than the alphabetic text. | Ensure the key contains exactly as many letters as there are letters in the text. |
| **File upload fails** | File exceeds 1 MB or is not plain text. | Ensure the file is encoded in UTF-8 or ASCII and under 1 MB. |

---

## 8. Educational-Security Disclaimer

> [!IMPORTANT]
> This application is strictly an educational tool developed for Network Security coursework.
> Classical substitution and transposition ciphers are historically significant but mathematically vulnerable to frequency analysis, Kasiski tests, and modern computing power.
> **DO NOT** use classical ciphers to protect sensitive personal, business, or financial data. Modern applications require standardized cryptographic standards such as AES-256, RSA, and SHA-256.
