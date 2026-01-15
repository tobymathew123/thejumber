import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, Team } from '../types';
import ShuffleAnimation from './ShuffleAnimation';
import TeamReveal from './TeamReveal';

interface HostViewProps {
    socket: any;
    onBack: () => void;
}

export default function HostView({ socket, onBack }: HostViewProps) {
    const [roomCode, setRoomCode] = useState<string>('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [numTeams, setNumTeams] = useState(2);
    const [balanceGender, setBalanceGender] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [teams, setTeams] = useState<Team[] | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!socket.connected) return;

        // Create room when component mounts
        socket.createRoom().then((response: any) => {
            if (response.success) {
                setRoomCode(response.roomCode);
                console.log('Room created:', response.roomCode);
            }
        });

        // Listen for participant joins
        if (socket.socket) {
            socket.socket.on('participant_joined', (data: any) => {
                console.log('Participant joined:', data);
                setParticipants(data.participants);
            });

            socket.socket.on('jumble_result', (data: { teams: Team[] }) => {
                console.log('Jumble result received:', data);
                // Animation will last 3 seconds, then show results
                setTimeout(() => {
                    setTeams(data.teams);
                    setIsShuffling(false);
                }, 3000);
            });
        }

        return () => {
            if (socket.socket) {
                socket.socket.off('participant_joined');
                socket.socket.off('jumble_result');
            }
        };
    }, [socket]);

    const handleJumble = async () => {
        if (participants.length === 0) {
            alert('No participants to shuffle!');
            return;
        }

        // Update config first
        await socket.updateConfig(roomCode, {
            numTeams,
            balanceGender
        });

        setIsShuffling(true);
        setTeams(null);

        // Execute jumble
        await socket.executeJumble(roomCode);
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (teams) {
        return <TeamReveal teams={teams} onReset={() => setTeams(null)} />;
    }

    if (isShuffling) {
        return <ShuffleAnimation />;
    }

    return (
        <div className="container" style={{ padding: '2rem', minHeight: '100vh' }}>
            <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                ← Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ marginBottom: '2rem' }}
            >
                <h2 style={{ marginBottom: '1rem', color: 'white' }}>🎯 Host Dashboard</h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div className="input-label">Room Code</div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div
                            style={{
                                flex: 1,
                                padding: '1rem 1.5rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '2px solid rgba(102, 126, 234, 0.5)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '2rem',
                                fontWeight: '700',
                                fontFamily: 'var(--font-display)',
                                textAlign: 'center',
                                letterSpacing: '0.3em',
                                color: 'white'
                            }}
                        >
                            {roomCode || 'Loading...'}
                        </div>
                        <button onClick={copyRoomCode} className="btn btn-secondary">
                            {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                    </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                        Share this code with participants to join your room
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card"
                style={{ marginBottom: '2rem' }}
            >
                <h3 style={{ marginBottom: '1rem', color: 'white' }}>⚙️ Shuffle Settings</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label className="input-label">Number of Teams</label>
                        <select
                            className="input"
                            value={numTeams}
                            onChange={(e) => setNumTeams(parseInt(e.target.value))}
                            style={{
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}
                        >
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num} style={{ background: '#1e2442', color: 'white' }}>
                                    {num} Teams
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Gender Balance</label>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 1.5rem',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            minHeight: '56px'
                        }}>
                            <input
                                type="checkbox"
                                checked={balanceGender}
                                onChange={(e) => setBalanceGender(e.target.checked)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: '#667eea',
                                    flexShrink: 0
                                }}
                            />
                            <span style={{ color: 'white', fontSize: '1rem', fontWeight: '500' }}>
                                Enable gender balance
                            </span>
                        </label>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card"
                style={{ marginBottom: '2rem' }}
            >
                <h3 style={{ marginBottom: '1rem', color: 'white' }}>
                    👥 Participants ({participants.length})
                </h3>

                <AnimatePresence>
                    {participants.length === 0 ? (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '2rem' }}
                        >
                            Waiting for participants to join...
                        </motion.p>
                    ) : (
                        <div className="participant-grid">
                            {participants.map((p, index) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card"
                                    style={{ padding: '1rem' }}
                                >
                                    <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'white' }}>
                                        {p.name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                        {p.college}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{ textAlign: 'center' }}
            >
                <button
                    onClick={handleJumble}
                    disabled={participants.length === 0}
                    className="btn btn-primary btn-large"
                    style={{
                        fontSize: '1.5rem',
                        padding: '1.5rem 3rem',
                        opacity: participants.length === 0 ? 0.5 : 1,
                        cursor: participants.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    🎰 JUMBLE!
                </button>
            </motion.div>
        </div>
    );
}
