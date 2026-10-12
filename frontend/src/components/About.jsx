import React from 'react';

export default function About() {
  return (
    <div className="about-project">
      {/* Title & Overview Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Design and Development of a Classical Cryptography Toolkit
            </h2>
            <p className="card-subtitle">
              Network Security Mini Project • Academic Year 2026–27
            </p>
          </div>
          <span className="badge badge-poly">ECE / CSE Capstone</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Course</span>
            <p style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>Network Security</p>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department & Level</span>
            <p style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>Final Year Electronics & Computer Engineering</p>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student / Author</span>
            <p style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>[Student Name / Roll No. / Batch Placeholder]</p>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Institution</span>
            <p style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>[College / University Name Placeholder]</p>
          </div>
        </div>
      </div>

      {/* Objectives & Architecture */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Project Objectives</h3>
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <li>Develop a unified, interactive menu-driven interface implementing 8 classical ciphers.</li>
            <li>Implement rigorous mathematical encryption and decryption transformations without hardcoded shortcuts.</li>
            <li>Provide dynamic key validation, automated key generation, and real-time matrix invertibility diagnostics.</li>
            <li>Enable comparative benchmarking of execution speed and ciphertext behavior under high-resolution timers.</li>
            <li>Support secure text-file container encryption and decryption with in-memory execution and zero disk persistence.</li>
            <li>Educate students on foundational cryptanalytic vulnerabilities and Kerckhoffs's principle.</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title">System Architecture & Tech Stack</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <strong style={{ color: 'var(--accent-cyan)' }}>Frontend:</strong> React 18, Vite 5, JavaScript (ES6+), Vanilla CSS (Responsive Dark Cyber Theme).
            </div>
            <div>
              <strong style={{ color: 'var(--accent-cyan)' }}>Backend:</strong> Python 3.13, Flask REST API, Flask-CORS, Werkzeug security utilities.
            </div>
            <div>
              <strong style={{ color: 'var(--accent-cyan)' }}>Testing Suite:</strong> pytest automated unit and integration tests (100% cipher and API coverage).
            </div>
            <div>
              <strong style={{ color: 'var(--accent-cyan)' }}>Design Philosophy:</strong> Zero external database dependencies, standard library math/crypto primitives, strictly local execution on Windows.
            </div>
          </div>
        </div>
      </div>

      {/* Theoretical Foundation */}
      <div className="card">
        <h3 className="card-title">Theoretical Foundations: Classical Cipher Taxonomies</h3>
        <div className="grid-2" style={{ marginTop: '1rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>1. Substitution Ciphers</h4>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              In substitution techniques, characters or groups of characters in the message are systematically replaced by other letters, symbols, or numerical vectors.
            </p>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li><strong>Caesar:</strong> Fixed modular shift along a single alphabet.</li>
              <li><strong>Monoalphabetic:</strong> Arbitrary permutation of 26 letters.</li>
              <li><strong>Playfair:</strong> Digraphic substitution on a 5×5 matrix with merged I/J.</li>
              <li><strong>Hill:</strong> Linear transformation C = (K × P) mod 26 using invertible matrices.</li>
              <li><strong>Vigenère & OTP:</strong> Polyalphabetic streams shifting letters via keywords or one-time random pads.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>2. Transposition Ciphers</h4>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              In transposition ciphers, the characters themselves are retained completely unchanged; instead, their geometric or positional order is scrambled.
            </p>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li><strong>Rail Fence:</strong> Positions characters along diagonal zigzags across N rails and reads horizontally.</li>
              <li><strong>Columnar Transposition:</strong> Formats text into rectangular matrix columns and reads out ordered by keyword alphabetical rank.</li>
              <li><strong>Frequency Preservation:</strong> Single-letter frequency distributions remain completely identical to the original plaintext.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Educational Purpose Disclaimer */}
      <div className="alert alert-info">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Educational Purpose & Academic Disclaimer</strong>
          This application is designed strictly for educational and pedagogical exploration of classical cryptography concepts in Network Security coursework. Classical ciphers (Caesar, Playfair, Hill, Vigenère, Transposition) are fundamentally broken by modern cryptanalytic methods (frequency analysis, index of coincidence, linear algebra, and computational brute-force). They must NEVER be used to protect real-world confidential, financial, or personal data. Modern secure communications require authenticated algorithms such as AES-GCM, RSA-OAEP, and ChaCha20-Poly1305.
        </div>
      </div>
    </div>
  );
}
