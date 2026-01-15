import { useState } from 'react';
import './index.css';
import { useSocket } from './hooks/useSocket';
import Home from './components/Home';
import HostView from './components/HostView';
import ParticipantView from './components/ParticipantView';

type View = 'home' | 'host' | 'participant';

function App() {
    const [view, setView] = useState<View>('home');
    const socket = useSocket();

    return (
        <div className="bg-animated" style={{ minHeight: '100vh' }}>
            {view === 'home' && (
                <Home
                    onCreateRoom={() => setView('host')}
                    onJoinRoom={() => setView('participant')}
                />
            )}

            {view === 'host' && (
                <HostView socket={socket} onBack={() => setView('home')} />
            )}

            {view === 'participant' && (
                <ParticipantView socket={socket} onBack={() => setView('home')} />
            )}
        </div>
    );
}

export default App;
