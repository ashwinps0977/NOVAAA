const socketIo = require('socket.io');

class SocketService {
    constructor() {
        this.io = null;
    }

    init(server) {
        this.io = socketIo(server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        this.io.on('connection', (socket) => {
            console.log('🔌 Client connected to WebSocket');

            socket.on('disconnect', () => {
                console.log('🔌 Client disconnected from WebSocket');
            });
        });

        return this.io;
    }

    emit(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    broadcastUpdate(collection, type, data = {}) {
        console.log(`📢 Broadcasting DB update: ${collection} | ${type}`);
        this.emit('db_update', {
            collection,
            type,
            timestamp: new Date().toISOString(),
            ...data
        });
    }
}

module.exports = new SocketService();
