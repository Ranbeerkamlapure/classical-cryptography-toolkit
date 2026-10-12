import React, { useState } from 'react';
import { encryptFile, decryptFile } from '../api';

const FILE_ALGORITHMS = [
  { id: 'caesar', name: 'Caesar Cipher', keyType: 'number', defaultKey: '3' },
  { id: 'monoalphabetic', name: 'Monoalphabetic Substitution', keyType: 'text', defaultKey: 'QWERTYUIOPASDFGHJKLZXCVBNM' },
  { id: 'playfair', name: 'Playfair Cipher', keyType: 'text', defaultKey: 'MONARCHY' },
  { id: 'hill', name: 'Hill Cipher (2x2 Matrix)', keyType: 'text', defaultKey: '[[9, 4], [5, 7]]' },
  { id: 'vigenere', name: 'Vigenère Cipher', keyType: 'text', defaultKey: 'CIPHER' },
  { id: 'otp', name: 'One-Time Pad (OTP)', keyType: 'text', defaultKey: '' },
  { id: 'rail_fence', name: 'Rail Fence Cipher', keyType: 'number', defaultKey: '3' },
  { id: 'columnar', name: 'Columnar Transposition', keyType: 'text', defaultKey: 'GERMAN' }
];

export default function FileTools() {
  const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'
  const [selectedAlgo, setSelectedAlgo] = useState('vigenere');
  const [keyInput, setKeyInput] = useState('CIPHER');
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedResult, setProcessedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAlgoChange = (e) => {
    const algoId = e.target.value;
    setSelectedAlgo(algoId);
    const meta = FILE_ALGORITHMS.find(a => a.id === algoId);
    if (meta) {
      setKeyInput(meta.defaultKey);
    }
  };

  const handleFileChange = (e) => {
    setErrorMsg('');
    setSuccessMsg('');
    setProcessedResult(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        setErrorMsg('File exceeds the 1 MB size limit.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleProcessFile = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!selectedFile) {
      setErrorMsg('Please select a text file (.txt) first.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'encrypt') {
        const res = await encryptFile(selectedFile, selectedAlgo, keyInput);
        if (res.success) {
          setProcessedResult({
            filename: res.filename,
            content: res.container_content,
            details: res.details,
            size: res.output_size,
            keyUsed: res.key_used
          });
          setSuccessMsg(`File successfully encrypted into documented container: ${res.filename}`);
        }
      } else {
        const res = await decryptFile(selectedFile, selectedAlgo, keyInput);
        if (res.success) {
          setProcessedResult({
            filename: res.filename,
            content: res.plaintext,
            details: res.details,
            size: res.plaintext.length,
            isContainer: res.is_container
          });
          setSuccessMsg(`File successfully decrypted: ${res.filename}`);
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResult = () => {
    if (!processedResult) return;
    const blob = new Blob([processedResult.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = processedResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="file-tools">
      {/* File Operations Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Text-File Cryptographic Processing
            </h2>
            <p className="card-subtitle">
              Upload plain-text files (.txt, max 1 MB), encrypt into formatted containers, or decrypt existing files.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${mode === 'encrypt' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setMode('encrypt');
                setProcessedResult(null);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              File Encrypt
            </button>
            <button
              className={`btn ${mode === 'decrypt' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setMode('decrypt');
                setProcessedResult(null);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              File Decrypt
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="alert alert-info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>
            <strong>Educational Disclaimer:</strong> Classical ciphers are not designed for confidential real-world files. Processing occurs entirely in-memory with zero permanent server storage. For OTP files, secret keys are never stored in the file!
          </span>
        </div>

        {/* Algorithm & Key Selection */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Algorithm</label>
            <select
              className="form-control"
              value={selectedAlgo}
              onChange={handleAlgoChange}
            >
              {FILE_ALGORITHMS.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Secret Key Parameter {selectedAlgo === 'otp' ? '(Required for Decryption; Auto-generated if blank for Encryption)' : ''}
            </label>
            <input
              type="text"
              className="form-control"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter key or matrix format..."
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>

        {/* File Upload Selector */}
        <div className="form-group">
          <label className="form-label">Upload Plaintext (.txt) or Encrypted Container File</label>
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              textAlign: 'center',
              background: 'var(--bg-input)',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" style={{ marginBottom: '0.5rem' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p style={{ fontWeight: 600, color: '#ffffff' }}>
              {selectedFile ? selectedFile.name : 'Click to choose a .txt file (Max 1 MB)'}
            </p>
            {selectedFile && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            )}
            <input
              id="file-upload-input"
              type="file"
              accept=".txt"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={handleProcessFile}
            disabled={loading || !selectedFile}
          >
            {loading ? 'Processing File...' : mode === 'encrypt' ? 'Encrypt & Format File' : 'Decrypt File'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div>{successMsg}</div>
        </div>
      )}

      {/* Output & Download Card */}
      {processedResult && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Processed File Result</h3>
            <button className="btn btn-primary" onClick={handleDownloadResult}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download {processedResult.filename}
            </button>
          </div>

          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Output Filename:</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{processedResult.filename}</p>
            </div>
            {processedResult.keyUsed && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key Applied:</span>
                <p style={{ fontFamily: 'var(--font-mono)' }}>
                  {typeof processedResult.keyUsed === 'object' ? JSON.stringify(processedResult.keyUsed) : String(processedResult.keyUsed)}
                </p>
              </div>
            )}
          </div>

          <label className="form-label">File Content Preview</label>
          <div className="cipher-output-box" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {processedResult.content}
          </div>
        </div>
      )}
    </div>
  );
}
