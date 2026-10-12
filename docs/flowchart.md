# System Architecture and Operational Flowchart

## Classical Cryptography Toolkit — Flowchart Specification

```mermaid
flowchart TD
    Start([Start]) --> Launch[Launch Application: Frontend Vite / Backend Flask]
    Launch --> CheckBackend{Backend Online?}
    CheckBackend -- No --> DisplayOffline[Display Backend Disconnected Alert]
    DisplayOffline --> Launch
    CheckBackend -- Yes --> SelectNav[User Selects Navigation Operation]

    %% Navigation Paths
    SelectNav --> ModeWorkspace[1. Encrypt / Decrypt Workspace]
    SelectNav --> ModeCompare[2. Compare Algorithms Module]
    SelectNav --> ModeFiles[3. Text-File Encryption / Decryption]
    SelectNav --> ModeHelp[4. Help & Algorithm Guide]
    SelectNav --> ModeAbout[5. About Project & Taxonomy]

    %% 1. Encrypt / Decrypt Path
    ModeWorkspace --> SelectAlgo[Select from 8 Classical Ciphers]
    SelectAlgo --> InputKey[Input or Generate Key / Matrix / Rails]
    InputKey --> EnterText[Enter Plaintext or Ciphertext]
    EnterText --> ChooseAction{Select Action}
    
    ChooseAction -- Encrypt --> ValidateEnc[Backend Validates Inputs & Key Modulo Rules]
    ValidateEnc -- Invalid --> ShowEncErr[Return HTTP 400 with Specific Error Message]
    ShowEncErr --> InputKey
    ValidateEnc -- Valid --> ExecEnc[Execute Cipher Algorithm & Record High-Res Timer]
    ExecEnc --> DisplayEncResult[Render Ciphertext, Diagnostics, & Copy Controls]

    ChooseAction -- Decrypt --> ValidateDec[Backend Validates Inputs & Invertibility]
    ValidateDec -- Invalid --> ShowDecErr[Return HTTP 400 with Specific Error Message]
    ShowDecErr --> InputKey
    ValidateDec -- Valid --> ExecDec[Execute Inverse Cipher Algorithm & Record Timer]
    ExecDec --> DisplayDecResult[Render Plaintext & Padding/Digraph Notes]

    DisplayEncResult --> SwapChoice{Swap to Input?}
    DisplayDecResult --> NextAction{Continue or Exit?}
    SwapChoice -- Yes --> EnterText
    SwapChoice -- No --> NextAction

    %% 2. Compare Algorithms Path
    ModeCompare --> InputCompText[Enter Benchmark Plaintext]
    InputCompText --> SelectMultiAlgo[Select 2 or More Ciphers & Configure Keys]
    SelectMultiAlgo --> RunBenchmark[Execute High-Resolution Timer Benchmarks]
    RunBenchmark --> RenderCompTable[Render Comparison Table: Output Length & Execution Times]
    RenderCompTable --> NextAction

    %% 3. File Processing Path
    ModeFiles --> UploadFile[Upload .txt File Max 1 MB]
    UploadFile --> SelectFileMode{File Mode?}
    SelectFileMode -- Encrypt --> EncFilePayload[Encrypt Content & Wrap in Documented Container]
    EncFilePayload --> DownloadEnc[Download Encrypted Container .txt File]
    SelectFileMode -- Decrypt --> ParseContainer[Parse Container Header / Extract Payload]
    ParseContainer --> DecFilePayload[Decrypt Payload with Validated Key]
    DecFilePayload --> DownloadDec[Download Recovered Plaintext .txt File]
    DownloadEnc --> NextAction
    DownloadDec --> NextAction

    %% Help & About
    ModeHelp --> BrowseGuides[Browse 8 Cipher Guides & Cryptography Glossary]
    BrowseGuides --> NextAction
    ModeAbout --> ReadAbout[Review System Architecture & Academic Details]
    ReadAbout --> NextAction

    %% Exit
    NextAction -- Continue --> SelectNav
    NextAction -- Exit --> Terminate([Exit Application])
```

## Workflow Explanation

1. **Initialization:** The browser loads the React interface on `http://localhost:5173`. On startup, a health probe requests `GET /api/health` from the Flask server (`http://127.0.0.1:5000`). If unreachable, an alert banner advises the user to start the Flask backend.
2. **Operation Dispatch:** Users select among five modular environments: Encrypt/Decrypt Workspace, Multi-Algorithm Benchmark Comparison, Text-File Processing, Help/Algorithm Guide, or About Project.
3. **Validation Gateway:** All user inputs (Caesar shifts, 26-letter monoalphabetic keys, Playfair keywords, Hill 2×2 matrix invertibility mod 26, OTP keys matching length, Rail Fence counts, Columnar keywords) are validated on the Flask backend. Invalid configurations return explicit descriptive HTTP 400 responses.
4. **Execution and Telemetry:** High-resolution timing (`time.perf_counter()`) tracks cipher execution time in milliseconds. Results, transformations, and metadata (e.g., matrix inverses, determinants, zigzag lengths) are returned as structured JSON.
5. **Reversibility and Continuity:** Users can copy outputs, download files, swap ciphertext into the input area for immediate round-trip verification, or switch between modules seamlessly.
