import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import CipherWorkspace from './components/CipherWorkspace';
import AlgorithmComparison from './components/AlgorithmComparison';
import FileTools from './components/FileTools';
import HelpGuide from './components/HelpGuide';
import About from './components/About';
import { checkHealth } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected', 'offline', 'checking'

  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  return (
    <div className="app-container">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {backendStatus === 'offline' && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <strong>Backend Offline:</strong> Could not connect to Flask API server at <code>http://127.0.0.1:5000</code>.
              Please start the backend server using: <code>python backend/app.py</code>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && <CipherWorkspace />}
        {activeTab === 'compare' && <AlgorithmComparison />}
        {activeTab === 'files' && <FileTools />}
        {activeTab === 'help' && <HelpGuide />}
        {activeTab === 'about' && <About />}
      </main>

      <footer className="app-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            Design and Development of a Classical Cryptography Toolkit • Final Year ECE (2026–27)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: backendStatus === 'connected' ? 'var(--success)' : backendStatus === 'offline' ? 'var(--danger)' : 'var(--warning)',
                display: 'inline-block'
              }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Backend: {backendStatus === 'connected' ? 'Connected (Port 5000)' : backendStatus === 'offline' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
