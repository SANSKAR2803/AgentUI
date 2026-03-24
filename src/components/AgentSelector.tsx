import type { Agent } from '../types';
import { useAppContext } from '../context/AppContext';

const agents: { value: Agent; label: string; icon: string }[] = [
  { value: 'form-filling', label: 'Form Filling', icon: '📝' },
  { value: 'job-researcher', label: 'Job Researcher', icon: '💼' },
  { value: 'yt-extractor', label: 'YT Extractor', icon: '🎬' },
];

export default function AgentSelector() {
  const { state, dispatch } = useAppContext();

  return (
    <div className="agent-selector">
      <div className="agent-selector-title">Agent</div>
      <div className="agent-pills">
        {agents.map((agent) => (
          <button
            key={agent.value}
            onClick={() => dispatch({ type: 'SET_AGENT', payload: agent.value })}
            className={`agent-pill ${state.activeAgent === agent.value ? 'active' : ''}`}
          >
            <span className="agent-pill-icon">{agent.icon}</span>
            <span className="agent-pill-label">{agent.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
