import { motion } from 'framer-motion';

interface HomeProps {
    onCreateRoom: () => void;
    onJoinRoom: () => void;
}

export default function Home({ onCreateRoom, onJoinRoom }: HomeProps) {
    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-center fade-in"
                >
                    <motion.h1
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ marginBottom: '1rem' }}
                    >
                        theJumbler
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            fontSize: '1.25rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '3rem',
                            maxWidth: '600px',
                            margin: '0 auto 3rem'
                        }}
                    >
                        Create balanced teams instantly with real-time shuffling and smart constraints
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        <button onClick={onCreateRoom} className="btn btn-primary btn-large">
                            🎲 Create Room
                        </button>
                        <button onClick={onJoinRoom} className="btn btn-secondary btn-large">
                            👥 Join Room
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="glass-card"
                        style={{
                            marginTop: '4rem',
                            maxWidth: '800px',
                            margin: '4rem auto 0'
                        }}
                    >
                        <h3 style={{ marginBottom: '1rem', color: 'white' }}>Features</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <div>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>Smart Shuffling</h4>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    Maximizes diversity by organization
                                </p>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚖️</div>
                                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>Gender Balance</h4>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    Optional balanced team composition
                                </p>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>Real-time Sync</h4>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    Everyone sees results instantly
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
