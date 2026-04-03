import { useState, useEffect } from 'react';
import type { Message } from '../types';
import { formatTimestamp } from '../utils/timeUtils';

interface MessageBubbleProps {
  message: Message;
}

const THINKING_FRAMES = [
  '[ ▓░░░░░░░░░ ] initializing...',
  '[ ▓▓░░░░░░░░ ] processing...',
  '[ ▓▓▓░░░░░░░ ] analyzing...',
  '[ ▓▓▓▓░░░░░░ ] reasoning...',
  '[ ▓▓▓▓▓░░░░░ ] computing...',
  '[ ▓▓▓▓▓▓░░░░ ] thinking...',
  '[ ▓▓▓▓▓▓▓░░░ ] processing...',
  '[ ▓▓▓▓▓▓▓▓░░ ] reasoning...',
  '[ ▓▓▓▓▓▓▓▓▓░ ] finalizing...',
];

function ThinkingTerminal() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % THINKING_FRAMES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="thinking-terminal">
      {THINKING_FRAMES[frameIndex]}
    </div>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isThinking = message.role === 'assistant' && message.isStreaming && message.content === '';

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      {/* Label above bubble */}
      <span className={`message-label ${isUser ? 'user-label' : 'assistant-label'}`}>
        {isUser ? '// YOU' : '// AGENT'}
      </span>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        {isThinking ? (
          <ThinkingTerminal />
        ) : (
          <div className="message-content">
            {message.content}
            {message.isStreaming && <span className="streaming-cursor">█</span>}
          </div>
        )}
        <div className="message-time">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
