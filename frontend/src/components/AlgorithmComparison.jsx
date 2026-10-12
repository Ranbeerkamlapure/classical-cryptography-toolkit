import React, { useState } from 'react';
import { compareAlgorithms } from '../api';

const AVAILABLE_ALGOS = [
  { id: 'caesar', name: 'Caesar Cipher', category: 'Substitution', defaultKey: 3, keyPrompt: 'Shift integer' },
  { id: 'monoalphabetic', name: 'Monoalphabetic Substitution', category: 'Substitution', defaultKey: 'QWERTYUIOPASDFGHJKLZXCVBNM', keyPrompt: '26-letter alphabet' },
  { id: 'playfair', name: 'Playfair Cipher', category: 'Substitution', defaultKey: 'MONARCHY', keyPrompt: 'Keyword' },
  { id: 'hill', name: 'Hill Cipher (2x2)', category: 'Substitution', defaultKey: [[9, 4], [5, 7]], keyPrompt: '2x2 Matrix JSON or values' },
  { id: 'vigenere', name: 'Vigenère Cipher', category: 'Polyalphabetic', defaultKey: 'CIPHER', keyPrompt: 'Keyword' },
  { id: 'otp', name: 'One-Time Pad (OTP)', category: 'Polyalphabetic', defaultKey: '', keyPrompt: 'Auto-generates if empty' },
  { id: 'rail_fence', name: 'Rail Fence Cipher', category: 'Transposition', defaultKey: 3, keyPrompt: 'Rails count' },
  { id: 'columnar', name: 'Columnar Transposition', category: 'Transposition', defaultKey: 'GERMAN', keyPrompt: 'Keyword' }
];

export default function AlgorithmComparison() {
  const [plaintext, setPlaintext] = useState('Network Security Cryptography Benchmark Test 2026');
  const [selectedIds, setSelectedIds] = useState(['caesar', 'vigenere', 'rail_fence', 'columnar']);
  const [customKeys, setCustomKeys] = useState({
    caesar: 3,
    monoalphabetic: 'QWERTYUIOPASDFGHJKLZXCVBNM',
    playfair: 'MONARCHY',
    hill: JSON.stringify([[9, 4], [5, 7]]),
    vigenere: 'CIPHER',
    otp: '',
    rail_fence: 3,
    columnar: 'GERMAN'
  });
  const [comparisonResults, setComparisonResults] = useState(null);
  const [disclaimer, setDisclaimer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleAlgoSelection = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        setErrorMsg('At least two algorithms must remain selected for comparison.');
        return;
      }
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
    setErrorMsg('');
  };

  const handleKeyChange = (algoId, val) => {
    setCustomKeys(prev => ({ ...prev, [algoId]: val }));
  };

  const handleRunComparison = async () => {
    setErrorMsg('');
    if (!plaintext.trim()) {
      setErrorMsg('Plaintext cannot be empty.');
      return;
    }
    if (selectedIds.length < 2) {
      setErrorMsg('Please select at least 2 algorithms to compare.');
      return;
    }

    setLoading(true);
    try {
      const selections = selectedIds.map(id => {
        let keyVal = customKeys[id];
        if (id === 'caesar' || id === 'rail_fence') {
          keyVal = parseInt(keyVal) || 3;
        } else if (id === 'hill') {
          try {
            keyVal = JSON.parse(keyVal);
          } catch (e) {
            keyVal = [[9, 4], [5, 7]];
          }
        }
        return {
          algorithm: id,
          key: keyVal
        };
      });

      const res = await compareAlgorithms(plaintext, selections);
      if (res.success) {
        setComparisonResults(res.results);
        setDisclaimer(res.disclaimer);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="algorithm-comparison">
      {/* Benchmark Setup Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Multi-Algorithm Comparative Benchmark
            </h2>
            <p className="card-subtitle">
              Evaluate and contrast cipher behaviors, transformation lengths, and execution timings on identical input.
            </p>
          </div>
          <span className="badge badge-poly">{selectedIds.length} Ciphers Selected</span>
        </div>

        {/* Plaintext Input */}
        <div className="form-group">
          <label className="form-label">Benchmark Plaintext Message</label>
          <textarea
            className="form-control"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            rows="3"
            placeholder="Type or paste plaintext to compare across selected ciphers..."
          />
        </div>

        {/* Algorithm Selection Grid */}
        <div className="form-group">
          <label className="form-label">Select Ciphers and Configure Keys (Choose 2 or more)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {AVAILABLE_ALGOS.map((algo) => {
              const isChecked = selectedIds.includes(algo.id);
              return (
                <div
                  key={algo.id}
                  style={{
                    background: isChecked ? 'rgba(0, 180, 216, 0.08)' : 'var(--bg-input)',
                    border: isChecked ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAlgoSelection(algo.id)}
                      style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px' }}
                    />
                    <span>{algo.name}</span>
                  </label>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Key: ({algo.keyPrompt})</span>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}
                      value={customKeys[algo.id] ?? ''}
                      onChange={(e) => handleKeyChange(algo.id, e.target.value)}
                      disabled={!isChecked}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={handleRunComparison}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            {loading ? 'Executing Benchmarks...' : 'Execute Comparative Analysis'}
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

      {/* Results Table */}
      {comparisonResults && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Comparative Analysis Results</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Input Length: {plaintext.length} characters
            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Output Length</th>
                  <th>Execution Time</th>
                  <th>Ciphertext Preview</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResults.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>{r.algorithm_name}</td>
                    <td>
                      <span className="badge badge-sub" style={{ fontSize: '0.7rem' }}>
                        {r.category || 'Classical'}
                      </span>
                    </td>
                    <td>
                      {r.success ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Success</span>
                      ) : (
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>✗ Failed</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {r.success ? `${r.ciphertext_length} chars` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {r.success ? `${r.execution_time_ms} ms` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', maxWidth: '300px', wordBreak: 'break-all' }}>
                      {r.success ? (
                        r.ciphertext.length > 50 ? `${r.ciphertext.substring(0, 50)}...` : r.ciphertext
                      ) : (
                        <span style={{ color: 'var(--danger)' }}>{r.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Educational Disclaimer */}
          {disclaimer && (
            <div className="alert alert-info" style={{ marginTop: '1.25rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="12" x2="12" y2="16"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>{disclaimer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
