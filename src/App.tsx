import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import LogTerminal from './components/LogTerminal';
import './index.css';

function App() {
  return (
    <AppProvider>
      <div className="app-layout">
        <Sidebar />
        <ChatPanel />
        <LogTerminal />
      </div>
    </AppProvider>
  );
}

export default App;
