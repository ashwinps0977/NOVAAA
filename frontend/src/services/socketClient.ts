import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketClient {
    private socket: Socket | null = null;

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to WebSocket Server');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket Server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket Connection Error:', error);
        });
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.socket) this.connect();
        this.socket?.on(event, callback);
    }

    off(event: string, callback: (data: any) => void) {
        this.socket?.off(event, callback);
    }

    emit(event: string, data: any) {
        if (!this.socket?.connected) this.connect();
        this.socket?.emit(event, data);
    }

    getSocket() {
        if (!this.socket) this.connect();
        return this.socket;
    }
}

const socketClient = new SocketClient();
export default socketClient;
