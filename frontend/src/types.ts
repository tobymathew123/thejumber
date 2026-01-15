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
}

export interface RoomState {
    code: string;
    participants: Participant[];
    shuffleConfig: ShuffleConfig;
    teams: Team[] | null;
    isShuffled: boolean;
}
