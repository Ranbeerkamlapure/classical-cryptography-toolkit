import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          <circle cx="12" cy="16" r="1"></circle>
        </svg>
        <div>
          <h1 className="header-title">Classical Cryptography Toolkit</h1>
          <p className="header-subtitle">Explore, Encrypt, Decrypt</p>
        </div>
      </div>
      <div className="header-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        Network Security • Final Year ECE (2026–27)
      </div>
    </header>
  );
}
