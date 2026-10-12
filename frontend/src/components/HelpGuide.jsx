import React, { useState } from 'react';

const CIPHER_GUIDES = [
  {
    id: 'caesar',
    name: '1. Caesar Cipher',
    category: 'Substitution',
    whatIs: 'A monoalphabetic substitution cipher named after Julius Caesar, who used it to communicate private military messages.',
    howItWorks: 'Each letter in the plaintext is shifted along the alphabet by a fixed integer number of positions modulo 26. Punctuation, numbers, and letter cases are preserved.',
    keyRepresents: 'An integer shift value (e.g., 3 means A becomes D, B becomes E). Negative numbers and shifts greater than 26 are evaluated modulo 26.',
    example: 'Plaintext: "HELLO", Key: 3 -> Ciphertext: "KHOOR". Decryption: Shift by -3 (or 23) -> "HELLO".',
    requirements: 'Must provide an integer shift key. Non-alphabetic characters remain unshifted.',
    limitations: 'Only 25 distinct non-trivial keys exist. Easily broken in seconds by brute-force search or letter frequency analysis.',
    usage: 'Enter shift integer in the key input. Click "Encrypt Text". To reverse, click "Swap to Input" and click "Decrypt Text".'
  },
  {
    id: 'monoalphabetic',
    name: '2. Monoalphabetic Substitution Cipher',
    category: 'Substitution',
    whatIs: 'A substitution cipher where each letter of the 26-letter plaintext alphabet is mapped to a unique letter of a permuted 26-letter cipher alphabet.',
    howItWorks: 'A 1-to-1 fixed bijection is established between the English alphabet and a scrambled 26-character key string. Letter case is preserved.',
    keyRepresents: 'A 26-character permutation of uppercase letters A through Z with no duplicates and no missing letters.',
    example: 'Alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ\nKey:      QWERTYUIOPASDFGHJKLZXCVBNM\n"ATTACK" -> "QZZQEA".',
    requirements: 'Key must be exactly 26 letters containing each letter from A to Z exactly once.',
    limitations: 'Vulnerable to single-letter frequency analysis (e.g., English "E" corresponds directly to the most frequent ciphertext letter).',
    usage: 'Click "Generate Valid Key" or type a 26-letter permutation. Encrypt and decrypt using the respective buttons.'
  },
  {
    id: 'playfair',
    name: '3. Playfair Cipher',
    category: 'Substitution',
    whatIs: 'A polygraphic substitution cipher invented by Charles Wheatstone in 1854 and popularized by Lord Playfair.',
    howItWorks: 'Text is split into pairs (digraphs). A 5x5 key matrix is built from a keyword where I and J are merged. Transformations follow row (shift right), column (shift down), and rectangle (swap columns) rules.',
    keyRepresents: 'A secret keyword. Non-alphabetic letters are discarded and duplicates removed to populate the initial cells of the 5x5 key square.',
    example: 'Keyword: "MONARCHY", Plaintext: "INSTRUMENTS". Digraphs: IN ST RU ME NT SX -> Ciphertext: "GA TQ MQ EH UT QZ".',
    requirements: 'Keyword must contain at least one alphabetic letter. Repeated letters in pairs require an inserted filler character ("X").',
    limitations: 'I and J are merged. Decrypted text retains inserted filler letters (e.g., "X"), which cannot be removed automatically without language heuristics.',
    usage: 'Provide an alphabetic keyword. Text is normalized to uppercase digraphs upon encryption.'
  },
  {
    id: 'hill',
    name: '4. Hill Cipher (2×2 Matrix)',
    category: 'Substitution',
    whatIs: 'A polygraphic linear algebraic cipher invented in 1929 by mathematician Lester S. Hill.',
    howItWorks: 'Plaintext is divided into vectors of 2 letters (mod 26). The vector is multiplied by a 2x2 key matrix mod 26: C = (K * P) mod 26. Decryption multiplies by the modular matrix inverse K^-1 mod 26.',
    keyRepresents: 'A 2x2 matrix of four integers whose determinant is coprime to 26 (i.e. gcd(det, 26) = 1).',
    example: 'Key: [[9, 4], [5, 7]]. det = (63 - 20) mod 26 = 17. Modular inverse det^-1 = 23. Inverse Matrix: [[5, 12], [15, 25]]. "HELP" -> "HIAT".',
    requirements: 'The determinant mod 26 must not share common factors with 26 (must be odd and not divisible by 13). Odd-length messages are padded with "X".',
    limitations: 'Vulnerable to known-plaintext attacks using simple linear algebra (solving simultaneous equations mod 26).',
    usage: 'Enter four matrix integers. The interface dynamically displays determinant and invertibility status.'
  },
  {
    id: 'vigenere',
    name: '5. Vigenère Cipher',
    category: 'Polyalphabetic Substitution',
    whatIs: 'A polyalphabetic substitution cipher described by Giovan Battista Bellaso in 1553 and later attributed to Blaise de Vigenère.',
    howItWorks: 'Uses a repeating alphabetic keyword. Each letter of the keyword determines a Caesar shift for the corresponding plaintext letter.',
    keyRepresents: 'An alphabetic keyword (e.g. "LEMON"). Each character represents a shift value from 0 (A) to 25 (Z).',
    example: 'Plaintext: "ATTACKATDAWN", Key: "LEMON" -> Ciphertext: "LXFOPVEFRNHR".',
    requirements: 'Keyword must contain at least one alphabetic character. Case, punctuation, and spacing are preserved.',
    limitations: 'Vulnerable to Kasiski examination and index of coincidence tests to deduce keyword length, followed by frequency analysis on cosets.',
    usage: 'Type an alphabetic keyword and click "Encrypt Text". Decrypt using the same keyword.'
  },
  {
    id: 'otp',
    name: '6. One-Time Pad (OTP)',
    category: 'Polyalphabetic Substitution',
    whatIs: 'An information-theoretically secure encryption technique invented by Gilbert Vernam and Frank Miller.',
    howItWorks: 'Each letter of the plaintext is shifted by an independently, uniformly random key letter modulo 26. Perfect secrecy is achieved if and only if conditions are met.',
    keyRepresents: 'A truly random sequence of letters equal in length to the number of alphabetic characters in the plaintext.',
    example: 'Plaintext: "SECRET" (6 letters), Random Key: "XMCKLQ" -> Ciphertext: "PPLDPF". Decrypt with "XMCKLQ" -> "SECRET".',
    requirements: '1. Key must be uniformly random. 2. Key must match message length. 3. Key must NEVER be reused. 4. Key must be kept strictly secret.',
    limitations: 'Key distribution problem: securely transferring a key as long as the message is as difficult as transferring the secret message itself.',
    usage: 'Click "Generate Key" or leave blank during encryption. Crucial: Copy and retain the key; the server never saves it!'
  },
  {
    id: 'rail_fence',
    name: '7. Rail Fence Cipher',
    category: 'Transposition',
    whatIs: 'A classic geometric transposition cipher that scrambles text by writing it in a zigzag pattern across multiple rails.',
    howItWorks: 'Characters are placed diagonally down and up across N rails. The ciphertext is formed by reading off each rail row horizontally from top to bottom.',
    keyRepresents: 'An integer N specifying the number of horizontal rails (depth of the zigzag).',
    example: 'Plaintext: "DEFEND THE EAST WALL", Rails: 3.\nRail 0: D . . . N . . . E . . . T . . . L\nRail 1: . E . E . D . H . E . S . W . L .\nRail 2: . . F . . . T . . . A . . . A . .\nCiphertext: "DNETLEEDHESWLLFTAA".',
    requirements: 'Rail count must be an integer >= 2. Preserves all letters, numbers, spaces, and punctuation.',
    limitations: 'Very small key space (number of rails is bounded by text length). Easy to break with brute-force anagramming.',
    usage: 'Input rail count (e.g. 3) and click Encrypt or Decrypt.'
  },
  {
    id: 'columnar',
    name: '8. Columnar Transposition Cipher',
    category: 'Transposition',
    whatIs: 'A transposition cipher where plaintext is written horizontally into a grid of fixed width and read vertically in a keyed permutation order.',
    howItWorks: 'Width is determined by keyword length. Columns are sorted alphabetically by keyword letters. Duplicate letters break ties by original column position.',
    keyRepresents: 'An alphabetic keyword defining column reading order.',
    example: 'Plaintext: "DEFENDTHEEASTWALLPOST", Keyword: "GERMAN".\nColumns sorted by G-E-R-M-A-N -> A(4), E(1), G(0), M(3), N(5), R(2).\nRead columns in sorted order.',
    requirements: 'Keyword must contain alphabetic characters. Handles incomplete final rows without lossy padding.',
    limitations: 'Letter frequencies are unchanged. Digraph frequencies and vowel spacing can reveal column pairings.',
    usage: 'Enter keyword in the key field and execute transposition.'
  }
];

const GLOSSARY = [
  { term: 'Plaintext', def: 'The original unencrypted message or data that is readable and intelligible.' },
  { term: 'Ciphertext', def: 'The scrambled, obfuscated output resulting from an encryption algorithm applied to plaintext.' },
  { term: 'Encryption', def: 'The mathematical or algorithmic process of converting plaintext into ciphertext to hide its meaning.' },
  { term: 'Decryption', def: 'The reverse process of reconstructing intelligible plaintext from ciphertext using a cryptographic key.' },
  { term: 'Cryptographic Key', def: 'A parameter or secret value that dictates the specific transformation performed during encryption and decryption.' },
  { term: 'Substitution Cipher', def: 'A cryptographic technique where units of plaintext (letters or groups) are systematically replaced with other symbols or letters.' },
  { term: 'Transposition Cipher', def: 'A cryptographic technique that preserves the identity of characters but scrambles their positions or order according to a geometric rule.' }
];

export default function HelpGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAlgo, setActiveAlgo] = useState('caesar');

  const filteredAlgos = CIPHER_GUIDES.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.whatIs.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedGuide = CIPHER_GUIDES.find(g => g.id === activeAlgo) || CIPHER_GUIDES[0];

  return (
    <div className="help-guide">
      {/* Search & Header Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Classical Cryptography Reference & Educational Guide
            </h2>
            <p className="card-subtitle">
              Comprehensive mathematical theory, key requirements, worked examples, and cryptanalytic limitations.
            </p>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search algorithms, terms, or mathematical principles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-2">
        {/* Left List */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Implemented Ciphers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredAlgos.map(algo => (
              <button
                key={algo.id}
                onClick={() => setActiveAlgo(algo.id)}
                style={{
                  background: activeAlgo === algo.id ? 'rgba(0, 180, 216, 0.12)' : 'var(--bg-input)',
                  border: activeAlgo === algo.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  color: activeAlgo === algo.id ? 'var(--accent-cyan)' : 'var(--text-main)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 600,
                  transition: 'var(--transition)'
                }}
              >
                <span>{algo.name}</span>
                <span className={`badge ${algo.category.includes('Poly') ? 'badge-poly' : algo.category.includes('Trans') ? 'badge-trans' : 'badge-sub'}`} style={{ fontSize: '0.65rem' }}>
                  {algo.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{selectedGuide.name}</h3>
            <span className="badge badge-sub">{selectedGuide.category}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span className="form-label">What It Is:</span>
              <p style={{ color: '#e2e8f0' }}>{selectedGuide.whatIs}</p>
            </div>

            <div>
              <span className="form-label">How It Works:</span>
              <p style={{ color: '#e2e8f0' }}>{selectedGuide.howItWorks}</p>
            </div>

            <div>
              <span className="form-label">Key Representation:</span>
              <p style={{ color: '#e2e8f0' }}>{selectedGuide.keyRepresents}</p>
            </div>

            <div>
              <span className="form-label">Verified Example:</span>
              <pre style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)', whiteSpace: 'pre-wrap' }}>
                {selectedGuide.example}
              </pre>
            </div>

            <div>
              <span className="form-label">Input & Key Requirements:</span>
              <p style={{ color: '#e2e8f0' }}>{selectedGuide.requirements}</p>
            </div>

            <div>
              <span className="form-label">Cryptographic Limitations:</span>
              <p style={{ color: '#fca5a5' }}>{selectedGuide.limitations}</p>
            </div>

            <div>
              <span className="form-label">How To Use on this Website:</span>
              <p style={{ color: '#cbd5e1' }}>{selectedGuide.usage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cryptography Glossary */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Essential Cryptographic Glossary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {GLOSSARY.map((item, idx) => (
            <div key={idx} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>{item.term}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.def}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
