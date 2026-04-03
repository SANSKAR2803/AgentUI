import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { formatLogTimestamp } from '../utils/timeUtils';
import type { LogLine } from '../types';

const WS_URL = 'ws://localhost:8080/ws/websocket';
const API_BASE = 'http://localhost:8080/api';

function getLogColor(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('[playwright]')) return '#60a5fa';
  if (lower.includes('[agent')) return '#facc15';
  if (lower.includes('[guardrail]')) {
    if (lower.includes('fail')) return '#f87171';
    return '#4ade80';
  }
  if (lower.includes('[query]')) return '#67e8f9';
  if (lower.includes('[decomposer]')) return '#fb923c';
  if (lower.includes('[stream]')) return '#e5e7eb';
  if (lower.includes('[memory]')) return '#c084fc';
  if (lower.includes('[ws]')) return '#6b7280';
  return '#e5e7eb';
}

export function useAgentSocket() {
  const { state, dispatch } = useAppContext();
  const clientRef = useRef<Client | null>(null);
  const streamingMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    let client: Client;

    try {
      client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 5000,
        connectionTimeout: 10000,
        onConnect: () => {
          dispatch({ type: 'SET_CONNECTED', payload: true });

          client.subscribe(
            '/topic/chat-stream',
            (message) => {
              const token = message.body;

              if (token === '__END__') {
                dispatch({ type: 'END_STREAMING' });
                streamingMsgIdRef.current = null;
                return;
              }

              if (!streamingMsgIdRef.current) {
                const msgId = uuidv4();
                streamingMsgIdRef.current = msgId;
                dispatch({
                  type: 'START_ASSISTANT_MESSAGE',
                  payload: { id: msgId, timestamp: new Date() },
                });
              }

              dispatch({ type: 'APPEND_TOKEN', payload: token });
            },
            { sessionId: state.currentSessionId }
          );

          client.subscribe(
            '/topic/logs',
            (message) => {
              const logLine: LogLine = {
                id: uuidv4(),
                timestamp: formatLogTimestamp(),
                text: message.body,
                color: getLogColor(message.body),
              };
              dispatch({ type: 'ADD_LOG', payload: logLine });
            },
            { sessionId: state.currentSessionId }
          );
        },
        onDisconnect: () => {
          dispatch({ type: 'SET_CONNECTED', payload: false });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          dispatch({ type: 'SET_CONNECTED', payload: false });
        },
        onWebSocketError: (event) => {
          console.warn('WebSocket connection error (backend may not be running):', event);
        },
      });

      client.activate();
      clientRef.current = client;
    } catch (err) {
      console.warn('Failed to initialize STOMP client:', err);
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentSessionId]);

  const sendMessage = useCallback(
    async (text: string, agent: string) => {
      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: state.currentSessionId,
            message: text,
            agent,
          }),
        });
        if (!response.ok) {
          console.error('Failed to send message:', response.statusText);
        }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    },
    [state.currentSessionId]
  );

  return { sendMessage };
}
