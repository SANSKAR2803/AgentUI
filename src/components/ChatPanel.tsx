import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { useAgentSocket } from '../hooks/useAgentSocket';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';

const EXAMPLE_PROMPTS = [
  '> Find remote ML jobs on LinkedIn',
  '> Extract top AI videos from YouTube',
  '> Fill the internship application form',
];

const ASCII_ART = `██████╗  █████╗ 
██╔══██╗██╔══██╗
██████╔╝███████║
██╔══██╗██╔══██║
██████╔╝██║  ██║
╚═════╝ ╚═╝  ╚═╝`;

export default function ChatPanel() {
  const { state, dispatch } = useAppContext();
  const { sendMessage } = useAgentSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [chipValue, setChipValue] = useState<string | undefined>(undefined);

  // Connection banner state
  const [banner, setBanner] = useState<{ type: 'online' | 'offline'; hiding: boolean } | null>(null);
  const prevConnectedRef = useRef(state.isConnected);

  useEffect(() => {
    if (prevConnectedRef.current !== state.isConnected) {
      prevConnectedRef.current = state.isConnected;
      const type = state.isConnected ? 'online' : 'offline';
      setBanner({ type, hiding: false });
      const hideTimer = setTimeout(() => {
        setBanner((b) => (b ? { ...b, hiding: true } : null));
      }, 2000);
      const removeTimer = setTimeout(() => {
        setBanner(null);
      }, 2300);
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [state.isConnected]);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  const handleSend = (text: string) => {
    const userMsg = {
      id: uuidv4(),
      role: 'user' as const,
      content: text,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_USER_MESSAGE', payload: userMsg });
    sendMessage(text, state.activeAgent);
  };

  const handleChipClick = (prompt: string) => {
    // Strip the "> " prefix before setting the value
    setChipValue(prompt.replace(/^>\s*/, ''));
  };

  const isEmpty = state.messages.length === 0;

  return (
    <main className="chat-panel">
      {/* Connection Banner */}
      {banner && (
        <div className={`connection-banner ${banner.type} ${banner.hiding ? 'hiding' : ''}`}>
          {banner.type === 'online'
            ? '● AGENT ONLINE — SESSION ESTABLISHED'
            : '● AGENT OFFLINE — CONNECTION LOST'}
        </div>
      )}

      <div className="chat-messages" ref={messagesContainerRef}>
        {isEmpty ? (
          <div className="empty-state">
            {/* ASCII watermark */}
            <pre className="empty-ascii-watermark">{ASCII_ART}</pre>
            
            {/* Prompt overlay */}
            <div className="empty-prompt">
              <h2 className="empty-title">
                $ waiting for input<span className="empty-title-cursor">_</span>
              </h2>
              <p className="empty-sub">// pick a task or type your own</p>
            </div>
            <div className="prompt-chips">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="prompt-chip"
                  onClick={() => handleChipClick(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {state.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <InputBar
        onSend={handleSend}
        externalValue={chipValue}
        onExternalValueConsumed={() => setChipValue(undefined)}
      />
    </main>
  );
}
