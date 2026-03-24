import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { useAgentSocket } from '../hooks/useAgentSocket';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';

const EXAMPLE_PROMPTS = [
  'Find remote ML jobs on LinkedIn',
  'Extract top AI videos from YouTube this week',
  'Fill the internship application form at [URL]',
];

export default function ChatPanel() {
  const { state, dispatch } = useAppContext();
  const { sendMessage } = useAgentSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [chipValue, setChipValue] = useState<string | undefined>(undefined);

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
    setChipValue(prompt);
  };

  const isEmpty = state.messages.length === 0;

  return (
    <main className="chat-panel">
      <div className="chat-messages" ref={messagesContainerRef}>
        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-robot">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="22" width="56" height="38" rx="10" stroke="#60a5fa" strokeWidth="2.5" fill="none" />
                <circle cx="30" cy="40" r="5" fill="#60a5fa" opacity="0.8" />
                <circle cx="50" cy="40" r="5" fill="#60a5fa" opacity="0.8" />
                <path d="M32 50 Q40 56 48 50" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M40 22 L40 12" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="40" cy="9" r="3" fill="#60a5fa" />
                <path d="M12 36 L4 28" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M68 36 L76 28" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M24 64 L36 58 L44 58 L56 64" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <h2 className="empty-title">What would you like me to do?</h2>
            <p className="empty-sub">Pick an example or type your own task below</p>
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
