import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { relativeTime } from '../utils/timeUtils';
import AgentSelector from './AgentSelector';

export default function Sidebar() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    fetch('http://localhost:8080/api/sessions')
      .then((res) => res.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessions = data.map((s: any) => ({
          id: s.id,
          preview: s.preview || s.firstMessage || 'New Chat',
          createdAt: new Date(s.createdAt),
        }));
        dispatch({ type: 'SET_SESSIONS', payload: sessions });
      })
      .catch((err) => console.error('Failed to load sessions:', err));
  }, [dispatch]);

  const handleNewChat = () => {
    const newId = uuidv4();
    dispatch({ type: 'NEW_CHAT', payload: newId });
  };

  const handleSelectSession = async (sessionId: string) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });
    try {
      const res = await fetch(`http://localhost:8080/api/sessions/${sessionId}`);
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages = (data.messages || data || []).map((m: any) => ({
        id: m.id || uuidv4(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp || m.createdAt),
        isStreaming: false,
      }));
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="24" height="16" rx="4" stroke="#60a5fa" strokeWidth="2" fill="none" />
            <circle cx="12" cy="16" r="2.5" fill="#60a5fa" />
            <circle cx="20" cy="16" r="2.5" fill="#60a5fa" />
            <path d="M10 26 L16 22 L22 26" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M16 8 L16 4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="3" r="1.5" fill="#60a5fa" />
            <path d="M4 14 L1 11" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <path d="M28 14 L31 11" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="sidebar-title">BrowserAgent</span>
        </div>
      </div>

      {/* New Chat Button */}
      <button onClick={handleNewChat} className="new-chat-btn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        New Chat
      </button>

      {/* Session List */}
      <div className="session-list">
        {state.sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => handleSelectSession(session.id)}
            className={`session-item ${session.id === state.currentSessionId ? 'active' : ''}`}
          >
            <div className="session-preview">
              {session.preview.length > 35
                ? session.preview.substring(0, 35) + '…'
                : session.preview}
            </div>
            <div className="session-time">{relativeTime(session.createdAt)}</div>
          </button>
        ))}
      </div>

      {/* Agent Selector at bottom */}
      <div className="sidebar-footer">
        <AgentSelector />
      </div>
    </aside>
  );
}
