import { customAlphabet } from 'nanoid';
import { Room, Participant, ShuffleConfig } from '../types';
import RedisClient from '../redis/RedisClient';
import { ShuffleService } from '../services/ShuffleService';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export class RoomManager {
    private redis: RedisClient;
    private static readonly ROOM_PREFIX = 'room:';
    private static readonly ROOM_EXPIRY = 24 * 60 * 60; // 24 hours

    constructor() {
        this.redis = RedisClient.getInstance();
    }

    /**
     * Create a new room with a unique code
     */
    public async createRoom(hostSocketId: string): Promise<string> {
        const code = nanoid();

        const room: Room = {
            code,
            hostSocketId,
            participants: new Map(),
            shuffleConfig: {
                numTeams: 2,
                balanceGender: false,
                maxDiversityWeight: 0.7,
                genderBalanceWeight: 0.3
            },
            teams: null,
            isShuffled: false,
            createdAt: new Date()
        };

        await this.saveRoom(room);
        console.log(`🎲 Room created: ${code} by host ${hostSocketId}`);

        return code;
    }

    /**
     * Add a participant to a room
     */
    public async addParticipant(
        roomCode: string,
        participant: Participant
    ): Promise<boolean> {
        const room = await this.getRoom(roomCode);
        if (!room) {
            console.error(`❌ Room ${roomCode} not found`);
            return false;
        }

        room.participants.set(participant.id, participant);
        await this.saveRoom(room);

        // Publish participant joined event
        await this.publishRoomUpdate(roomCode, 'participant_joined', participant);

        console.log(`👤 Participant ${participant.name} joined room ${roomCode}`);
        return true;
    }

    /**
     * Remove a participant from a room
     */
    public async removeParticipant(
        roomCode: string,
        participantId: string
    ): Promise<boolean> {
        const room = await this.getRoom(roomCode);
        if (!room) return false;

        const participant = room.participants.get(participantId);
        room.participants.delete(participantId);
        await this.saveRoom(room);

        // Publish participant left event
        await this.publishRoomUpdate(roomCode, 'participant_left', { id: participantId });

        console.log(`👋 Participant ${participantId} left room ${roomCode}`);
        return true;
    }

    /**
     * Update shuffle configuration for a room
     */
    public async updateShuffleConfig(
        roomCode: string,
        config: Partial<ShuffleConfig>
    ): Promise<boolean> {
        const room = await this.getRoom(roomCode);
        if (!room) return false;

        room.shuffleConfig = { ...room.shuffleConfig, ...config };
        await this.saveRoom(room);

        console.log(`⚙️ Shuffle config updated for room ${roomCode}`, config);
        return true;
    }

    /**
     * Execute the shuffle for a room
     */
    public async executeJumble(roomCode: string): Promise<boolean> {
        const room = await this.getRoom(roomCode);
        if (!room) return false;

        const participants = Array.from(room.participants.values());

        if (participants.length === 0) {
            console.error(`❌ Cannot shuffle room ${roomCode}: no participants`);
            return false;
        }

        // Run the shuffle algorithm
        const result = ShuffleService.shuffle(participants, room.shuffleConfig);

        room.teams = result.teams;
        room.isShuffled = true;
        await this.saveRoom(room);

        // Publish shuffle complete event with results
        await this.publishRoomUpdate(roomCode, 'shuffle_complete', {
            teams: result.teams,
            diversityScore: result.diversityScore,
            genderBalanceScore: result.genderBalanceScore
        });

        console.log(`🎰 Jumble executed for room ${roomCode}`);
        console.log(`   Diversity Score: ${result.diversityScore}%`);
        console.log(`   Gender Balance Score: ${result.genderBalanceScore}%`);

        return true;
    }

    /**
     * Get room data
     */
    public async getRoom(roomCode: string): Promise<Room | null> {
        const key = `${RoomManager.ROOM_PREFIX}${roomCode}`;
        const data = await this.redis.get(key);

        if (!data) return null;

        const parsed = JSON.parse(data);

        // Convert participants array back to Map
        const participants = new Map<string, Participant>();
        if (parsed.participants) {
            Object.entries(parsed.participants).forEach(([key, value]) => {
                participants.set(key, value as Participant);
            });
        }

        return {
            ...parsed,
            participants,
            createdAt: new Date(parsed.createdAt)
        };
    }

    /**
     * Check if room exists
     */
    public async roomExists(roomCode: string): Promise<boolean> {
        const key = `${RoomManager.ROOM_PREFIX}${roomCode}`;
        const exists = await this.redis.exists(key);
        return exists === 1;
    }

    /**
     * Delete a room
     */
    public async deleteRoom(roomCode: string): Promise<boolean> {
        const key = `${RoomManager.ROOM_PREFIX}${roomCode}`;
        const result = await this.redis.delete(key);
        console.log(`🗑️ Room ${roomCode} deleted`);
        return result === 1;
    }

    /**
     * Save room data to Redis
     */
    private async saveRoom(room: Room): Promise<void> {
        const key = `${RoomManager.ROOM_PREFIX}${room.code}`;

        // Convert Map to object for JSON serialization
        const participantsObj: { [key: string]: Participant } = {};
        room.participants.forEach((value, key) => {
            participantsObj[key] = value;
        });

        const data = {
            ...room,
            participants: participantsObj
        };

        await this.redis.setWithExpiry(
            key,
            JSON.stringify(data),
            RoomManager.ROOM_EXPIRY
        );
    }

    /**
     * Publish room update event via Redis Pub/Sub
     */
    private async publishRoomUpdate(
        roomCode: string,
        event: string,
        data: any
    ): Promise<void> {
        const channel = `room:${roomCode}:updates`;
        const message = JSON.stringify({ event, data, timestamp: Date.now() });
        await this.redis.publish(channel, message);
    }

    /**
     * Subscribe to room updates
     */
    public async subscribeToRoom(
        roomCode: string,
        callback: (event: string, data: any) => void
    ): Promise<void> {
        const channel = `room:${roomCode}:updates`;
        await this.redis.subscribe(channel, (message) => {
            const parsed = JSON.parse(message);
            callback(parsed.event, parsed.data);
        });
    }
}
