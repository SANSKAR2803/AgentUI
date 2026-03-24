import type { Message } from '../types';
import { formatTimestamp } from '../utils/timeUtils';

interface MessageBubbleProps {
  message: Message;
}

function ThinkingDots() {
  return (
    <div className="thinking-dots">
      <span className="dot" style={{ animationDelay: '0ms' }}></span>
      <span className="dot" style={{ animationDelay: '150ms' }}></span>
      <span className="dot" style={{ animationDelay: '300ms' }}></span>
    </div>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isThinking = message.role === 'assistant' && message.isStreaming && message.content === '';

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="avatar">
          <span>A</span>
        </div>
      )}
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        {isThinking ? (
          <ThinkingDots />
        ) : (
          <div className="message-content">
            {message.content}
            {message.isStreaming && <span className="streaming-cursor">▊</span>}
          </div>
        )}
        <div className="message-time">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
