import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Participant, Team } from '../types';

const SOCKET_URL = 'http://localhost:3001';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
            console.log('✅ Connected to server');
            setConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('❌ Connection error:', error);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const createRoom = useCallback((): Promise<{ success: boolean; roomCode?: string; error?: string }> => {
        return new Promise((resolve) => {
            if (!socket) {
                resolve({ success: false, error: 'Socket not connected' });
                return;
            }

            socket.emit('create_room', (response: any) => {
                resolve(response);
            });
        });
    }, [socket]);

    const joinRoom = useCallback((
        roomCode: string,
        participant: Omit<Participant, 'id' | 'socketId'>
    ): Promise<{ success: boolean; participants?: Participant[]; error?: string }> => {
        return new Promise((resolve) => {
            if (!socket) {
                resolve({ success: false, error: 'Socket not connected' });
                return;
            }

            socket.emit('join_room', { roomCode, participant }, (response: any) => {
                resolve(response);
            });
        });
    }, [socket]);

    const updateConfig = useCallback((
        roomCode: string,
        config: { numTeams?: number; balanceGender?: boolean }
    ): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            if (!socket) {
                resolve({ success: false, error: 'Socket not connected' });
                return;
            }

            socket.emit('update_config', { roomCode, config }, (response: any) => {
                resolve(response);
            });
        });
    }, [socket]);

    const executeJumble = useCallback((roomCode: string): Promise<{ success: boolean; teams?: Team[]; error?: string }> => {
        return new Promise((resolve) => {
            if (!socket) {
                resolve({ success: false, error: 'Socket not connected' });
                return;
            }

            socket.emit('execute_jumble', { roomCode }, (response: any) => {
                resolve(response);
            });
        });
    }, [socket]);

    const getRoomState = useCallback((roomCode: string): Promise<any> => {
        return new Promise((resolve) => {
            if (!socket) {
                resolve({ success: false, error: 'Socket not connected' });
                return;
            }

            socket.emit('get_room_state', { roomCode }, (response: any) => {
                resolve(response);
            });
        });
    }, [socket]);

    return {
        socket,
        connected,
        createRoom,
        joinRoom,
        updateConfig,
        executeJumble,
        getRoomState,
    };
};
