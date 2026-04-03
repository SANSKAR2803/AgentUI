export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

export type Session = {
  id: string;
  preview: string;
  createdAt: Date;
};

export type Agent = 'form-filling' | 'job-researcher' | 'yt-extractor';

export type LogLine = {
  id: string;
  timestamp: string;
  text: string;
  color: string;
};

export type AppState = {
  sessions: Session[];
  currentSessionId: string;
  messages: Message[];
  logs: LogLine[];
  activeAgent: Agent;
  isConnected: boolean;
  isStreaming: boolean;
};

export type AppAction =
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'SET_CURRENT_SESSION'; payload: string }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_USER_MESSAGE'; payload: Message }
  | { type: 'START_ASSISTANT_MESSAGE'; payload: { id: string; timestamp: Date } }
  | { type: 'APPEND_TOKEN'; payload: string }
  | { type: 'END_STREAMING' }
  | { type: 'ADD_LOG'; payload: LogLine }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_AGENT'; payload: Agent }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'NEW_CHAT'; payload: string };
