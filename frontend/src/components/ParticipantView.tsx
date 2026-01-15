import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Participant, Team } from '../types';
import ShuffleAnimation from './ShuffleAnimation';
import TeamReveal from './TeamReveal';

interface ParticipantViewProps {
    socket: any;
    onBack: () => void;
}

export default function ParticipantView({ socket, onBack }: ParticipantViewProps) {
    const [roomCode, setRoomCode] = useState('');
    const [name, setName] = useState('');
    const [college, setCollege] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say'>('prefer-not-to-say');
    const [joined, setJoined] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isShuffling, setIsShuffling] = useState(false);
    const [teams, setTeams] = useState<Team[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!socket.socket || !joined) return;

        socket.socket.on('participant_joined', (data: any) => {
            setParticipants(data.participants);
        });

        socket.socket.on('jumble_result', (data: { teams: Team[] }) => {
            setIsShuffling(true);
            // Wait for animation to finish
            setTimeout(() => {
                setTeams(data.teams);
                setIsShuffling(false);
            }, 3000);
        });

        return () => {
            if (socket.socket) {
                socket.socket.off('participant_joined');
                socket.socket.off('jumble_result');
            }
        };
    }, [socket, joined]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!roomCode.trim() || !name.trim() || !college.trim()) {
            setError('Please fill in all fields');
            return;
        }

        const participant: Omit<Participant, 'id' | 'socketId'> = {
            name: name.trim(),
            college: college.trim(),
            gender
        };

        const response = await socket.joinRoom(roomCode.toUpperCase().trim(), participant);

        if (response.success) {
            setJoined(true);
            setParticipants(response.participants || []);
        } else {
            setError(response.error || 'Failed to join room');
        }
    };

    if (teams) {
        return <TeamReveal teams={teams} onReset={() => setTeams(null)} />;
    }

    if (isShuffling) {
        return <ShuffleAnimation />;
    }

    if (!joined) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
                <div className="container" style={{ maxWidth: '500px' }}>
                    <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                        ← Back
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                    >
                        <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: 'white' }}>
                            Join a Room
                        </h2>

                        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label className="input-label">Room Code</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter 6-digit code"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    style={{ textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.5rem' }}
                                />
                            </div>

                            <div>
                                <label className="input-label">Your Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="input-label">College / Organization</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Stanford University"
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="input-label">Gender</label>
                                <select
                                    className="input"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as any)}
                                    style={{
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="male" style={{ background: '#1e2442', color: 'white' }}>Male</option>
                                    <option value="female" style={{ background: '#1e2442', color: 'white' }}>Female</option>
                                    <option value="other" style={{ background: '#1e2442', color: 'white' }}>Other</option>
                                    <option value="prefer-not-to-say" style={{ background: '#1e2442', color: 'white' }}>Prefer not to say</option>
                                </select>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(255, 0, 0, 0.1)',
                                        border: '1px solid rgba(255, 0, 0, 0.3)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: '#ff6b6b',
                                        textAlign: 'center'
                                    }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }}>
                                Join Room
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem', minHeight: '100vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card text-center"
            >
                <h2 style={{ marginBottom: '1rem', color: 'white' }}>✅ Joined Room {roomCode}</h2>
                <p style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
                    Waiting for the host to start the jumble...
                </p>

                <div style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'white' }}>
                        Participants in Room ({participants.length})
                    </h3>
                    <div className="participant-grid">
                        {participants.map((p, index) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{ padding: '1rem' }}
                            >
                                <div style={{ fontWeight: '600', color: 'white' }}>{p.name}</div>
                                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    {p.college}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ marginTop: '2rem', fontSize: '3rem' }}
                >
                    ⏳
                </motion.div>
            </motion.div>
        </div>
    );
}
