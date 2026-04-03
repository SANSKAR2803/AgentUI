import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

function MatrixRain({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 12;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -50);
    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890ABCDEF>_|/\\'.split('');

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#00ff8818';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.4;
      }
      animationRef.current = requestAnimationFrame(draw);
    }

    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas"
      style={{ width, height }}
    />
  );
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function LogTerminal() {
  const { state, dispatch } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const logBodyRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [bodySize, setBodySize] = useState({ width: 0, height: 0 });

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Measure log body for matrix canvas
  const measureBody = useCallback(() => {
    if (logBodyRef.current) {
      const rect = logBodyRef.current.getBoundingClientRect();
      setBodySize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }
  }, []);

  useEffect(() => {
    measureBody();
    window.addEventListener('resize', measureBody);
    return () => window.removeEventListener('resize', measureBody);
  }, [measureBody]);

  // Auto-scroll on new logs
  useEffect(() => {
    if (logBodyRef.current) {
      logBodyRef.current.scrollTop = logBodyRef.current.scrollHeight;
    }
  }, [state.logs]);

  const showMatrix = state.logs.length === 0;

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

      <aside className={`log-terminal ${isVisible ? 'visible' : ''}`} ref={containerRef}>
        <div className="log-header">
          <div className="log-header-left">
            <span className={`log-dot ${state.isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="log-title">AGENT_TERMINAL</span>
            <span className={`log-status-text ${state.isConnected ? 'connected' : 'disconnected'}`}>
              {state.isConnected ? '● LIVE' : '● OFFLINE'}
            </span>
          </div>
          <div className="log-header-right">
            <span className="log-uptime">uptime: {formatUptime(uptime)}</span>
            <button
              className="clear-logs-btn"
              onClick={() => dispatch({ type: 'CLEAR_LOGS' })}
              title="Clear logs"
            >
              RM -RF LOGS
            </button>
          </div>
        </div>

        <div className="log-body" ref={logBodyRef}>
          {/* Matrix rain in idle state */}
          {showMatrix && bodySize.width > 0 && (
            <MatrixRain width={bodySize.width} height={bodySize.height} />
          )}

          {state.logs.length === 0 && (
            <div className="log-empty">// awaiting agent telemetry...</div>
          )}
          {state.logs.map((log) => (
            <div key={log.id} className="log-line" style={{ color: log.color }}>
              <span className="log-timestamp">[{log.timestamp}]</span>
              <span className="log-text">{log.text}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
