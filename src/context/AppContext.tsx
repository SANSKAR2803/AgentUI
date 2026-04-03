import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, AppAction, Agent } from '../types';
import { v4 as uuidv4 } from 'uuid';

const MAX_LOGS = 200;

function getInitialSessionId(): string {
  const stored = localStorage.getItem('browseragent-session-id');
  if (stored) return stored;
  const id = uuidv4();
  localStorage.setItem('browseragent-session-id', id);
  return id;
}

function getInitialAgent(): Agent {
  const stored = localStorage.getItem('browseragent-agent');
  if (stored && ['form-filling', 'job-researcher', 'yt-extractor'].includes(stored)) {
    return stored as Agent;
  }
  return 'job-researcher';
}

const initialState: AppState = {
  sessions: [],
  currentSessionId: getInitialSessionId(),
  messages: [],
  logs: [],
  activeAgent: getInitialAgent(),
  isConnected: false,
  isStreaming: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };

    case 'SET_CURRENT_SESSION':
      localStorage.setItem('browseragent-session-id', action.payload);
      return { ...state, currentSessionId: action.payload };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'ADD_USER_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };

    case 'START_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.payload.id,
            role: 'assistant',
            content: '',
            timestamp: action.payload.timestamp,
            isStreaming: true,
          },
        ],
        isStreaming: true,
      };

    case 'APPEND_TOKEN': {
      const msgs = [...state.messages];
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
        msgs[msgs.length - 1] = {
          ...lastMsg,
          content: lastMsg.content + action.payload,
        };
      }
      return { ...state, messages: msgs };
    }

    case 'END_STREAMING': {
      const msgs = [...state.messages];
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
        msgs[msgs.length - 1] = { ...lastMsg, isStreaming: false };
      }
      return { ...state, messages: msgs, isStreaming: false };
    }

    case 'ADD_LOG': {
      const logs = [...state.logs, action.payload];
      if (logs.length > MAX_LOGS) {
        return { ...state, logs: logs.slice(logs.length - MAX_LOGS) };
      }
      return { ...state, logs };
    }

    case 'CLEAR_LOGS':
      return { ...state, logs: [] };

    case 'SET_AGENT':
      localStorage.setItem('browseragent-agent', action.payload);
      return { ...state, activeAgent: action.payload };

    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };

    case 'NEW_CHAT':
      localStorage.setItem('browseragent-session-id', action.payload);
      return {
        ...state,
        currentSessionId: action.payload,
        messages: [],
        isStreaming: false,
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
