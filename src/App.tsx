import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

interface ColimaStatus {
  active: boolean;
  container_runtime: string | null;
  cpu: number | null;
  memory: string | null;
  disk: string | null;
}

function App() {
  const [status, setStatus] = useState<ColimaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<'start' | 'stop' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const result = await invoke<ColimaStatus>('get_colima_status');
      setStatus(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatus();
  }, []);

  const handleAction = async (action: 'start' | 'stop') => {
    setActiveAction(action);
    setActionLoading(true);
    setError(null);

    try {
      await invoke(`colima_${action}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      void fetchStatus();
      setActionLoading(false);
      setActiveAction(null);
    }
  };

  if (loading) {
    return (
      <main className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Checking Colima status...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <div className="dashboard">
        <header className="header">
          <h1 className="app-title">Colima Manager</h1>
          <p className="app-subtitle">Container runtime management for macOS</p>
        </header>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="status-card">
          <div className="card-header">
            <div className="status-indicator">
              <span className={`status-dot ${status?.active ? 'active' : 'inactive'}`}></span>
              <span className="status-text">{status?.active ? 'Running' : 'Stopped'}</span>
            </div>
            <div className="action-buttons">
              {!status?.active && (
                <button
                  className={`btn btn-start ${actionLoading && activeAction === 'start' ? 'btn-loading' : ''}`}
                  onClick={() => handleAction('start')}
                  disabled={actionLoading && activeAction === 'start'}
                  aria-busy={actionLoading && activeAction === 'start'}
                >
                  {actionLoading && activeAction === 'start' ? (
                    <>
                      <span className="button-spinner"></span>
                      Starting...
                    </>
                  ) : (
                    'Start'
                  )}
                </button>
              )}
              {status?.active && (
                <button
                  className={`btn btn-stop ${actionLoading && activeAction === 'stop' ? 'btn-loading' : ''}`}
                  onClick={() => handleAction('stop')}
                  disabled={actionLoading && activeAction === 'stop'}
                  aria-busy={actionLoading && activeAction === 'stop'}
                >
                  {actionLoading && activeAction === 'stop' ? (
                    <>
                      <span className="button-spinner"></span>
                      Stopping...
                    </>
                  ) : (
                    'Stop'
                  )}
                </button>
              )}
              <button className="btn btn-refresh" onClick={fetchStatus}>
                ↻
              </button>
            </div>
          </div>

          {status?.active && (
            <div className="card-body">
              <div className="specs-grid">
                <div className="spec-item">
                  <div className="spec-icon">⚙</div>
                  <div className="spec-content">
                    <span className="spec-label">CPUs</span>
                    <span className="spec-value">{status.cpu ?? '—'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <div className="spec-icon">💾</div>
                  <div className="spec-content">
                    <span className="spec-label">Memory</span>
                    <span className="spec-value">{status.memory ?? '—'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <div className="spec-icon">💿</div>
                  <div className="spec-content">
                    <span className="spec-label">Disk</span>
                    <span className="spec-value">{status.disk ?? '—'}</span>
                  </div>
                </div>

                {status.container_runtime && (
                  <div className="spec-item">
                    <div className="spec-icon">🐳</div>
                    <div className="spec-content">
                      <span className="spec-label">Runtime</span>
                      <span className="spec-value">{status.container_runtime}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="quick-actions">
                <button className="btn btn-outline" onClick={fetchStatus}>
                  Refresh Status
                </button>
              </div>
            </div>
          )}

          {!status?.active && (
            <div className="card-body card-body-empty">
              <p className="empty-text">
                Colima is currently stopped. Click <strong>Start</strong> to get started.
              </p>
            </div>
          )}
        </div>

        <footer className="footer">
          <button className="btn-link" onClick={fetchStatus}>
            Refresh Status
          </button>
        </footer>
      </div>
    </main>
  );
}

export default App;
