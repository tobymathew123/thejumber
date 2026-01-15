import { motion } from 'framer-motion';
import { Team } from '../types';
import { useEffect, useState } from 'react';

interface TeamRevealProps {
    teams: Team[];
    onReset?: () => void;
}

export default function TeamReveal({ teams, onReset }: TeamRevealProps) {
    const [myTeam, setMyTeam] = useState<Team | null>(null);

    useEffect(() => {
        // For participant view, find which team they're on
        // This will be enhanced when we track current user's socket ID
        if (teams.length > 0) {
            // For now, just show all teams (host view)
            // Participant view would show their specific team
            setMyTeam(teams[0]);
        }
    }, [teams]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{
                minHeight: '100vh',
                background: myTeam ? myTeam.color : '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated background effect */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '150%',
                    height: '150%',
                    background: `radial-gradient(circle, ${myTeam?.color || '#667eea'} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                }}
            />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'backOut' }}
                    className="text-center"
                >
                    {onReset && (
                        <button
                            onClick={onReset}
                            className="btn btn-secondary"
                            style={{ marginBottom: '2rem', background: 'rgba(0, 0, 0, 0.3)' }}
                        >
                            ← Back to Dashboard
                        </button>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: 'clamp(2rem, 6vw, 5rem)',
                            marginBottom: '3rem',
                            color: 'white',
                            textShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        🎉 Teams Formed!
                    </motion.h1>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem',
                            marginTop: '3rem',
                        }}
                    >
                        {teams.map((team, index) => (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                className="team-card"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '2rem',
                                    borderLeft: `6px solid ${team.color}`,
                                    borderColor: team.color,
                                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${team.color}40`,
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: '2rem',
                                        marginBottom: '1.5rem',
                                        color: team.color,
                                        textShadow: `0 0 20px ${team.color}`,
                                    }}
                                >
                                    {team.name}
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {team.members.map((member, mIndex) => (
                                        <motion.div
                                            key={member.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 + index * 0.1 + mIndex * 0.05 }}
                                            style={{
                                                padding: '1rem',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: 'var(--radius-sm)',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <div style={{ fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
                                                {member.name}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                                {member.college}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div
                                    style={{
                                        marginTop: '1.5rem',
                                        padding: '0.75rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.875rem',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                    }}
                                >
                                    {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
