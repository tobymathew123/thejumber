export interface Participant {
    id: string;
    name: string;
    college: string;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    socketId: string;
}

export interface Team {
    id: number;
    name: string;
    color: string;
    members: Participant[];
}

export interface ShuffleConfig {
    numTeams: number;
    balanceGender: boolean;
    maxDiversityWeight: number; // 0-1, how much to prioritize college diversity
    genderBalanceWeight: number; // 0-1, how much to prioritize gender balance
}

export interface Room {
    code: string;
    hostSocketId: string;
    participants: Map<string, Participant>;
    shuffleConfig: ShuffleConfig;
    teams: Team[] | null;
    isShuffled: boolean;
    createdAt: Date;
}

export interface TeamAssignment {
    teams: Team[];
    diversityScore: number; // metric showing how well constraints were met
    genderBalanceScore: number;
}

export const TEAM_NAMES = [
    'Cosmic Voyagers',
    'Neon Ninjas',
    'Quantum Questers',
    'Cyber Phoenixes',
    'Electric Eagles',
    'Mystic Mavericks',
    'Stellar Spirits',
    'Digital Dragons',
    'Hyper Hawks',
    'Aurora Avengers'
];

export const TEAM_COLORS = [
    '#00F0FF', // Electric Blue
    '#FF006E', // Neon Pink
    '#FFBE0B', // Cyber Yellow
    '#00FF85', // Toxic Green
    '#B537F2', // Vivid Purple
    '#FF4365', // Hot Red
    '#06FFA5', // Mint Electric
    '#FFA400', // Amber Glow
    '#5E17EB', // Deep Violet
    '#FF00BD'  // Magenta Blaze
];
