import React, { useState, useEffect } from 'react';
import { encryptText, decryptText, generateKey } from '../api';

const DEFAULT_ALGORITHMS = [
  { id: 'caesar', name: 'Caesar Cipher', category: 'Substitution', desc: 'Shifts each letter by a fixed integer number of positions.' },
  { id: 'monoalphabetic', name: 'Monoalphabetic Substitution', category: 'Substitution', desc: 'Substitutes each letter with a corresponding unique letter from a 26-character permuted alphabet.' },
  { id: 'playfair', name: 'Playfair Cipher', category: 'Substitution', desc: 'Encrypts letter pairs (digraphs) using a 5x5 key matrix with merged I/J.' },
  { id: 'hill', name: 'Hill Cipher (2x2 Matrix)', category: 'Substitution', desc: 'Linear algebraic cipher using 2x2 matrix multiplication modulo 26.' },
  { id: 'vigenere', name: 'Vigenère Cipher', category: 'Polyalphabetic Substitution', desc: 'Polyalphabetic shift based on repeating letters of an alphabetic keyword.' },
  { id: 'otp', name: 'One-Time Pad (OTP)', category: 'Polyalphabetic Substitution', desc: 'Information-theoretically secure cipher pairing text with a random key of equal length.' },
  { id: 'rail_fence', name: 'Rail Fence Cipher', category: 'Transposition', desc: 'Transposes message along a zigzag pattern across multiple horizontal rails.' },
  { id: 'columnar', name: 'Columnar Transposition', category: 'Transposition', desc: 'Arranges text in columns and transposes them based on alphabetical order of keyword.' }
];

export default function CipherWorkspace() {
  const [selectedAlgo, setSelectedAlgo] = useState('caesar');
  const [inputText, setInputText] = useState('HELLO NETWORK SECURITY 2026!');
  const [outputText, setOutputText] = useState('');
  const [operationDetails, setOperationDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Key states per algorithm
  const [caesarShift, setCaesarShift] = useState(3);
  const [monoKey, setMonoKey] = useState('QWERTYUIOPASDFGHJKLZXCVBNM');
  const [playfairKeyword, setPlayfairKeyword] = useState('MONARCHY');
  const [hillMatrix, setHillMatrix] = useState([
    [9, 4],
    [5, 7]
  ]);
  const [vigenereKeyword, setVigenereKeyword] = useState('CIPHER');
  const [otpKey, setOtpKey] = useState('');
  const [railFenceRails, setRailFenceRails] = useState(3);
  const [columnarKeyword, setColumnarKeyword] = useState('GERMAN');

  // Real-time Hill Determinant Check
  const detMod26 = ((hillMatrix[0][0] * hillMatrix[1][1] - hillMatrix[0][1] * hillMatrix[1][0]) % 26 + 26) % 26;
  const isHillInvertible = detMod26 % 2 !== 0 && detMod26 % 13 !== 0;

  // Clear messages on algorithm change
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setOutputText('');
    setOperationDetails(null);
  }, [selectedAlgo]);

  const getActiveKey = () => {
    switch (selectedAlgo) {
      case 'caesar':
        return caesarShift;
      case 'monoalphabetic':
        return monoKey;
      case 'playfair':
        return playfairKeyword;
      case 'hill':
        return [
          [parseInt(hillMatrix[0][0]) || 0, parseInt(hillMatrix[0][1]) || 0],
          [parseInt(hillMatrix[1][0]) || 0, parseInt(hillMatrix[1][1]) || 0]
        ];
      case 'vigenere':
        return vigenereKeyword;
      case 'otp':
        return otpKey;
      case 'rail_fence':
        return railFenceRails;
      case 'columnar':
        return columnarKeyword;
      default:
        return '';
    }
  };

  const handleGenerateKey = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (selectedAlgo === 'monoalphabetic') {
        const res = await generateKey('monoalphabetic');
        if (res.success) {
          setMonoKey(res.key);
          setSuccessMsg('Generated fresh random 26-letter substitution alphabet.');
        }
      } else if (selectedAlgo === 'otp') {
        const count = (inputText.match(/[a-zA-Z]/g) || []).length;
        const res = await generateKey('otp', count > 0 ? count : 16);
        if (res.success) {
          setOtpKey(res.key);
          setSuccessMsg(`Generated ${res.key.length}-letter random key for One-Time Pad.`);
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleEncrypt = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const key = getActiveKey();
      const res = await encryptText(selectedAlgo, inputText, key);
      if (res.success) {
        setOutputText(res.ciphertext);
        setOperationDetails({
          type: 'Encryption',
          timeMs: res.execution_time_ms,
          keyUsed: res.key,
          details: res.details
        });
        if (selectedAlgo === 'otp' && res.key) {
          setOtpKey(res.key);
        }
        setSuccessMsg(`Encryption successful! (${res.execution_time_ms} ms)`);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const key = getActiveKey();
      const res = await decryptText(selectedAlgo, inputText, key);
      if (res.success) {
        setOutputText(res.plaintext);
        setOperationDetails({
          type: 'Decryption',
          timeMs: res.execution_time_ms,
          keyUsed: res.key,
          details: res.details
        });
        setSuccessMsg(`Decryption successful! (${res.execution_time_ms} ms)`);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    if (outputText) {
      setInputText(outputText);
      setOutputText('');
      setOperationDetails(null);
      setSuccessMsg('Moved output text to input field for immediate reverse processing.');
    }
  };

  const handleCopyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyKey = () => {
    const key = typeof getActiveKey() === 'object' ? JSON.stringify(getActiveKey()) : getActiveKey();
    if (!key) return;
    navigator.clipboard.writeText(String(key));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const currentAlgoMeta = DEFAULT_ALGORITHMS.find(a => a.id === selectedAlgo) || DEFAULT_ALGORITHMS[0];

  return (
    <div className="cipher-workspace">
      {/* Algorithm Selector Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              Cryptographic Algorithm Selection
            </h2>
            <p className="card-subtitle">{currentAlgoMeta.desc}</p>
          </div>
          <span className={`badge ${currentAlgoMeta.category === 'Substitution' ? 'badge-sub' : currentAlgoMeta.category === 'Transposition' ? 'badge-trans' : 'badge-poly'}`}>
            {currentAlgoMeta.category}
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Select Classical Cipher</label>
          <select
            className="form-control"
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
          >
            {DEFAULT_ALGORITHMS.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name} ({algo.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Key Configuration Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-2-2l2 2M3 21l10-10m0 0l3 3m-3-3l-2-2"></path>
              <circle cx="7.5" cy="16.5" r="3.5"></circle>
            </svg>
            Key Configuration & Parameters
          </h2>
          {(selectedAlgo === 'monoalphabetic' || selectedAlgo === 'otp') && (
            <button className="btn btn-secondary" onClick={handleGenerateKey}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              Generate Valid Key
            </button>
          )}
        </div>

        {/* Caesar inputs */}
        {selectedAlgo === 'caesar' && (
          <div className="form-group">
            <label className="form-label">Shift Integer (Supports positive, negative, and modulo 26)</label>
            <input
              type="number"
              className="form-control"
              value={caesarShift}
              onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)}
              style={{ maxWidth: '240px' }}
            />
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
              Effective alphabet shift: <strong>{(caesarShift % 26 + 26) % 26}</strong> (Mod 26)
            </small>
          </div>
        )}

        {/* Monoalphabetic inputs */}
        {selectedAlgo === 'monoalphabetic' && (
          <div>
            <div className="form-group">
              <label className="form-label">26-Letter Substitution Alphabet (A-Z Permutation)</label>
              <input
                type="text"
                className="form-control"
                value={monoKey}
                onChange={(e) => setMonoKey(e.target.value.toUpperCase())}
                maxLength={26}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alphabet Mapping:</span>
              <span className="code-badge">A-Z → {monoKey}</span>
              <span style={{ fontSize: '0.8rem', color: monoKey.length === 26 && new Set(monoKey).size === 26 ? 'var(--success)' : 'var(--danger)' }}>
                {monoKey.length === 26 && new Set(monoKey).size === 26 ? '✓ 26 Unique Letters' : `✗ (${monoKey.length}/26 letters, ${new Set(monoKey).size} unique)`}
              </span>
            </div>
          </div>
        )}

        {/* Playfair inputs */}
        {selectedAlgo === 'playfair' && (
          <div>
            <div className="form-group">
              <label className="form-label">Keyword (Letters only, J merges into I)</label>
              <input
                type="text"
                className="form-control"
                value={playfairKeyword}
                onChange={(e) => setPlayfairKeyword(e.target.value.toUpperCase())}
                style={{ maxWidth: '360px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Note: Duplicate letters in the key are removed. 'J' is merged into 'I'. Repeated letters in digraphs get filler 'X'.
            </p>
          </div>
        )}

        {/* Hill inputs */}
        {selectedAlgo === 'hill' && (
          <div>
            <label className="form-label">2×2 Key Matrix Modulo 26</label>
            <div className="matrix-grid-2x2">
              <input
                type="number"
                className="form-control matrix-cell"
                value={hillMatrix[0][0]}
                onChange={(e) => {
                  const m = [...hillMatrix];
                  m[0][0] = parseInt(e.target.value) || 0;
                  setHillMatrix(m);
                }}
              />
              <input
                type="number"
                className="form-control matrix-cell"
                value={hillMatrix[0][1]}
                onChange={(e) => {
                  const m = [...hillMatrix];
                  m[0][1] = parseInt(e.target.value) || 0;
                  setHillMatrix(m);
                }}
              />
              <input
                type="number"
                className="form-control matrix-cell"
                value={hillMatrix[1][0]}
                onChange={(e) => {
                  const m = [...hillMatrix];
                  m[1][0] = parseInt(e.target.value) || 0;
                  setHillMatrix(m);
                }}
              />
              <input
                type="number"
                className="form-control matrix-cell"
                value={hillMatrix[1][1]}
                onChange={(e) => {
                  const m = [...hillMatrix];
                  m[1][1] = parseInt(e.target.value) || 0;
                  setHillMatrix(m);
                }}
              />
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Determinant: <strong>{detMod26} mod 26</strong>
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isHillInvertible ? 'var(--success)' : 'var(--danger)' }}>
                {isHillInvertible ? '✓ Invertible (gcd=1)' : '✗ Non-Invertible (No modular inverse)'}
              </span>
            </div>
          </div>
        )}

        {/* Vigenere inputs */}
        {selectedAlgo === 'vigenere' && (
          <div className="form-group">
            <label className="form-label">Alphabetic Keyword</label>
            <input
              type="text"
              className="form-control"
              value={vigenereKeyword}
              onChange={(e) => setVigenereKeyword(e.target.value.toUpperCase())}
              style={{ maxWidth: '360px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        )}

        {/* OTP inputs */}
        {selectedAlgo === 'otp' && (
          <div>
            <div className="form-group">
              <label className="form-label">
                One-Time Pad Secret Key (Must match number of alphabetic characters: {(inputText.match(/[a-zA-Z]/g) || []).length})
              </label>
              <input
                type="text"
                className="form-control"
                value={otpKey}
                onChange={(e) => setOtpKey(e.target.value.toUpperCase())}
                placeholder="Leave blank during encryption to auto-generate, or paste key for decryption"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div className="alert alert-info" style={{ marginTop: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>
                <strong>Crucial OTP Security Rule:</strong> The key must be completely random, as long as the message, used <em>only once</em>, and preserved securely by the user for decryption. Never reuse a One-Time Pad key!
              </span>
            </div>
          </div>
        )}

        {/* Rail Fence inputs */}
        {selectedAlgo === 'rail_fence' && (
          <div className="form-group">
            <label className="form-label">Number of Rails (Integer ≥ 2)</label>
            <input
              type="number"
              className="form-control"
              value={railFenceRails}
              min="2"
              onChange={(e) => setRailFenceRails(Math.max(2, parseInt(e.target.value) || 2))}
              style={{ maxWidth: '200px' }}
            />
          </div>
        )}

        {/* Columnar inputs */}
        {selectedAlgo === 'columnar' && (
          <div className="form-group">
            <label className="form-label">Keyword (Determines column permutations)</label>
            <input
              type="text"
              className="form-control"
              value={columnarKeyword}
              onChange={(e) => setColumnarKeyword(e.target.value.toUpperCase())}
              style={{ maxWidth: '360px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        )}
      </div>

      {/* Workspace Inputs & Outputs */}
      <div className="grid-2">
        {/* Input Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Input Text</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Length: {inputText.length} chars
            </span>
          </div>
          <div className="form-group">
            <textarea
              className="form-control"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter plaintext to encrypt or ciphertext to decrypt..."
              rows="6"
            />
          </div>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={handleEncrypt}
              disabled={loading || !inputText}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Encrypt Text
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleDecrypt}
              disabled={loading || !inputText}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
              </svg>
              Decrypt Text
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setInputText('');
                setOutputText('');
                setErrorMsg('');
                setSuccessMsg('');
                setOperationDetails(null);
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Processed Output</h3>
            {outputText && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Length: {outputText.length} chars
              </span>
            )}
          </div>
          <div className="cipher-output-box">
            {outputText || <span style={{ color: 'var(--text-dim)' }}>Output will appear here after encryption or decryption...</span>}
          </div>
          <div className="btn-row">
            <button
              className="btn btn-secondary"
              onClick={handleCopyOutput}
              disabled={!outputText}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {copiedText ? 'Copied Output!' : 'Copy Output'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCopyKey}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-2-2l2 2M3 21l10-10m0 0l3 3m-3-3l-2-2"></path>
                <circle cx="7.5" cy="16.5" r="3.5"></circle>
              </svg>
              {copiedKey ? 'Copied Key!' : 'Copy Key'}
            </button>
            <button
              className="btn btn-outline"
              onClick={handleSwap}
              disabled={!outputText}
              title="Send output back into input text area to test reverse decryption"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              Swap to Input
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="alert alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <strong>Error:</strong> {errorMsg}
          </div>
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

      {/* Execution Diagnostics Card */}
      {operationDetails && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Cryptographic Execution Diagnostics</h3>
            <span className="code-badge">{operationDetails.type}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Execution Time:</span>
              <p style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{operationDetails.timeMs} ms</p>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key Parameter:</span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                {typeof operationDetails.keyUsed === 'object' ? JSON.stringify(operationDetails.keyUsed) : String(operationDetails.keyUsed)}
              </p>
            </div>
          </div>
          {operationDetails.details && Object.keys(operationDetails.details).length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Algorithm Metadata:</strong>
              <pre style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', color: '#cbd5e1' }}>
                {JSON.stringify(operationDetails.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
