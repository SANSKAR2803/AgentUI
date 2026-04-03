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
          <span className="sidebar-logo-chevron">&gt;</span>
          <span className="sidebar-title">BrowserAgent<span className="sidebar-title-cursor">_</span></span>
        </div>
        <span className="sidebar-version">// autonomous web agent v1.0</span>
      </div>

      {/* Section Label */}
      <div className="section-label">// SESSIONS</div>

      {/* New Chat Button */}
      <button onClick={handleNewChat} className="new-chat-btn">
        [ + NEW SESSION ]
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
