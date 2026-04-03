import { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function LogTerminal() {
  const { state, dispatch } = useAppContext();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [state.logs]);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="log-toggle-btn"
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Toggle logs"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M5 8l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Backdrop for mobile */}
      {isVisible && (
        <div className="log-backdrop" onClick={() => setIsVisible(false)} />
      )}

      <aside className={`log-terminal ${isVisible ? 'visible' : ''}`}>
        <div className="log-header">
          <div className="log-header-left">
            <span className={`log-dot ${state.isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="log-title">Agent Terminal</span>
          </div>
          <div className="log-header-right">
            <span className={`connection-badge ${state.isConnected ? 'connected' : 'disconnected'}`}>
              {state.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
            <button
              className="clear-logs-btn"
              onClick={() => dispatch({ type: 'CLEAR_LOGS' })}
              title="Clear logs"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="log-body" ref={containerRef}>
          {state.logs.length === 0 && (
            <div className="log-empty">Waiting for agent logs…</div>
          )}
          {state.logs.map((log) => (
            <div key={log.id} className="log-line" style={{ color: log.color }}>
              <span className="log-timestamp">{log.timestamp}</span>
              <span className="log-text">{log.text}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </aside>
    </>
  );
}
