import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './managers/RoomManager';
import { Participant } from './types';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialize managers
const roomManager = new RoomManager();

// Express middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Host: Create a new room
    socket.on('create_room', async (callback) => {
        try {
            const roomCode = await roomManager.createRoom(socket.id);
            socket.join(roomCode);

            callback({ success: true, roomCode });
            console.log(`✅ Room ${roomCode} created by ${socket.id}`);
        } catch (error) {
            console.error('❌ Error creating room:', error);
            callback({ success: false, error: 'Failed to create room' });
        }
    });

    // Participant: Join a room
    socket.on('join_room', async (data: { roomCode: string; participant: Omit<Participant, 'id' | 'socketId'> }, callback) => {
        try {
            const { roomCode, participant } = data;

            // Check if room exists
            const roomExists = await roomManager.roomExists(roomCode);
            if (!roomExists) {
                callback({ success: false, error: 'Room not found' });
                return;
            }

            // Create full participant object
            const fullParticipant: Participant = {
                ...participant,
                id: socket.id,
                socketId: socket.id
            };

            // Add participant to room
            const success = await roomManager.addParticipant(roomCode, fullParticipant);

            if (success) {
                socket.join(roomCode);

                // Get updated room data
                const room = await roomManager.getRoom(roomCode);
                const participants = room ? Array.from(room.participants.values()) : [];

                // Notify everyone in the room about the new participant
                io.to(roomCode).emit('participant_joined', {
                    participant: fullParticipant,
                    participants
                });

                callback({ success: true, participants });
                console.log(`✅ ${fullParticipant.name} joined room ${roomCode}`);
            } else {
                callback({ success: false, error: 'Failed to join room' });
            }
        } catch (error) {
            console.error('❌ Error joining room:', error);
            callback({ success: false, error: 'Failed to join room' });
        }
    });

    // Host: Update shuffle configuration
    socket.on('update_config', async (data: { roomCode: string; config: any }, callback) => {
        try {
            const { roomCode, config } = data;
            const success = await roomManager.updateShuffleConfig(roomCode, config);

            if (success) {
                // Notify all participants about config update
                io.to(roomCode).emit('config_updated', config);
                callback({ success: true });
            } else {
                callback({ success: false, error: 'Failed to update config' });
            }
        } catch (error) {
            console.error('❌ Error updating config:', error);
            callback({ success: false, error: 'Failed to update config' });
        }
    });

    // Host: Execute the jumble
    socket.on('execute_jumble', async (data: { roomCode: string }, callback) => {
        try {
            const { roomCode } = data;

            // Execute the shuffle
            const success = await roomManager.executeJumble(roomCode);

            if (success) {
                const room = await roomManager.getRoom(roomCode);

                if (room && room.teams) {
                    // Emit shuffle results to all participants in the room
                    io.to(roomCode).emit('jumble_result', {
                        teams: room.teams
                    });

                    callback({ success: true, teams: room.teams });
                    console.log(`🎰 Jumble executed for room ${roomCode}`);
                } else {
                    callback({ success: false, error: 'Failed to retrieve shuffle results' });
                }
            } else {
                callback({ success: false, error: 'Failed to execute jumble' });
            }
        } catch (error) {
            console.error('❌ Error executing jumble:', error);
            callback({ success: false, error: 'Failed to execute jumble' });
        }
    });

    // Get current room state
    socket.on('get_room_state', async (data: { roomCode: string }, callback) => {
        try {
            const room = await roomManager.getRoom(data.roomCode);

            if (room) {
                callback({
                    success: true,
                    room: {
                        code: room.code,
                        participants: Array.from(room.participants.values()),
                        shuffleConfig: room.shuffleConfig,
                        teams: room.teams,
                        isShuffled: room.isShuffled
                    }
                });
            } else {
                callback({ success: false, error: 'Room not found' });
            }
        } catch (error) {
            console.error('❌ Error getting room state:', error);
            callback({ success: false, error: 'Failed to get room state' });
        }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);

        // Note: In a production app, you'd want to:
        // 1. Track which room the user was in
        // 2. Remove them from that room
        // 3. Notify other participants
        // 4. If host disconnects, handle room cleanup or transfer
    });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`
🚀 theJumbler Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on port ${PORT}
✅ Socket.io enabled
✅ CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
    });
});
