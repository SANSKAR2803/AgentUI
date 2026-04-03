import type { Agent } from '../types';
import { useAppContext } from '../context/AppContext';

const AGENT_COLORS: Record<Agent, string> = {
  'form-filling': '#3b82f6',
  'job-researcher': '#a855f7',
  'yt-extractor': '#ef4444',
};

const agents: { value: Agent; label: string }[] = [
  { value: 'form-filling', label: 'Form Filling' },
  { value: 'job-researcher', label: 'Job Researcher' },
  { value: 'yt-extractor', label: 'YT Extractor' },
];

function AgentIcon({ agent }: { agent: Agent }) {
  const color = AGENT_COLORS[agent];
  if (agent === 'form-filling') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="12" height="14" rx="1.5" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M5 5h6M5 8h6M5 11h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (agent === 'job-researcher') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M10.5 10.5L14 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  // yt-extractor
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M6.5 6v4l3.5-2z" fill={color} />
    </svg>
  );
}

export default function AgentSelector() {
  const { state, dispatch } = useAppContext();

  return (
    <div className="agent-selector">
      <div className="agent-selector-title">// ACTIVE AGENT</div>
      <div className="agent-pills">
        {agents.map((agent) => {
          const isActive = state.activeAgent === agent.value;
          const agentColor = AGENT_COLORS[agent.value];
          return (
            <button
              key={agent.value}
              onClick={() => dispatch({ type: 'SET_AGENT', payload: agent.value })}
              className={`agent-pill ${isActive ? 'active' : ''}`}
              style={isActive ? { borderLeftColor: agentColor } : undefined}
            >
              <span
                className="agent-pill-dot"
                style={{ background: agentColor }}
              />
              <span className="agent-pill-icon">
                <AgentIcon agent={agent.value} />
              </span>
              <span className="agent-pill-label">{agent.label}</span>
              {isActive && <span className="agent-pill-status">ACTIVE</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
