import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const TEAM_NAMES = [
    'Cosmic Voyagers',
    'Neon Ninjas',
    'Quantum Questers',
    'Cyber Phoenixes',
    'Electric Eagles',
    'Mystic Mavericks',
    'Stellar Spirits',
    'Digital Dragons',
];

export default function ShuffleAnimation() {
    const [currentName, setCurrentName] = useState(0);
    const [speed, setSpeed] = useState(50);

    useEffect(() => {
        // Gradually slow down the animation
        const interval = setInterval(() => {
            setCurrentName((prev) => (prev + 1) % TEAM_NAMES.length);
        }, speed);

        // Increase speed over time to create slowdown effect
        const speedInterval = setInterval(() => {
            setSpeed((prev) => Math.min(prev + 10, 500));
        }, 200);

        return () => {
            clearInterval(interval);
            clearInterval(speedInterval);
        };
    }, [speed]);

    return (
        <div
            className="flex-center flex-col"
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
            }}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: 'backOut' }}
                style={{ textAlign: 'center' }}
            >
                <motion.div
                    animate={{
                        rotateY: [0, 360],
                    }}
                    transition={{
                        duration: 3,
                        ease: 'linear',
                        repeat: Infinity,
                    }}
                    style={{
                        fontSize: '8rem',
                        marginBottom: '2rem',
                    }}
                >
                    🎰
                </motion.div>

                <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'white' }}>
                    Jumbling Teams...
                </h2>

                <motion.div
                    key={currentName}
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        fontFamily: 'var(--font-display)',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 0 40px rgba(102, 126, 234, 0.5)',
                    }}
                >
                    {TEAM_NAMES[currentName]}
                </motion.div>

                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        marginTop: '3rem',
                        width: '300px',
                        height: '4px',
                        background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
                        backgroundSize: '200% 100%',
                        borderRadius: '2px',
                        animation: 'gradientShift 2s ease infinite',
                    }}
                />
            </motion.div>
        </div>
    );
}
