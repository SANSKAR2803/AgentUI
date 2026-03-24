import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVoiceInput } from '../hooks/useVoiceInput';

const AGENT_LABELS: Record<string, string> = {
  'form-filling': 'Form Filling',
  'job-researcher': 'Job Researcher',
  'yt-extractor': 'YT Extractor',
};

interface InputBarProps {
  onSend: (text: string) => void;
  externalValue?: string;
  onExternalValueConsumed?: () => void;
}

export default function InputBar({ onSend, externalValue, onExternalValueConsumed }: InputBarProps) {
  const { state } = useAppContext();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: voiceSupported,
    toggleListening,
  } = useVoiceInput();

  // Append transcript from voice input
  useEffect(() => {
    if (transcript) {
      setValue((prev) => {
        const needsSpace = prev.length > 0 && !prev.endsWith(' ');
        return prev + (needsSpace ? ' ' : '') + transcript;
      });
    }
  }, [transcript]);

  useEffect(() => {
    if (externalValue) {
      setValue(externalValue);
      onExternalValueConsumed?.();
      textareaRef.current?.focus();
    }
  }, [externalValue, onExternalValueConsumed]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || state.isStreaming) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Display text: actual value + any interim voice text
  const displayPlaceholder = isListening
    ? interimTranscript || 'Listening…'
    : 'Type your task here…';

  return (
    <div className="input-bar">
      {/* Voice listening indicator */}
      {isListening && (
        <div className="voice-listening-bar">
          <div className="voice-wave">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <span className="voice-listening-text">
            {interimTranscript || 'Listening…'}
          </span>
          <button className="voice-stop-btn" onClick={toggleListening}>
            Stop
          </button>
        </div>
      )}

      <div className="input-bar-inner">
        <span className="input-agent-badge">
          {AGENT_LABELS[state.activeAgent]}
        </span>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={displayPlaceholder}
          rows={1}
          className="input-textarea"
        />

        <div className="input-bar-footer">
          {value.length > 200 && (
            <span className="char-counter">{value.length}</span>
          )}

          {/* Voice input button */}
          {voiceSupported && (
            <button
              onClick={toggleListening}
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2" fill={isListening ? 'currentColor' : 'none'} />
                <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 22h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={!value.trim() || state.isStreaming}
            className="send-btn"
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 16V4M10 4L5 9M10 4L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
