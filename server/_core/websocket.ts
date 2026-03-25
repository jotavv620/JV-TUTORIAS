import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] User connected: ${socket.id}`);

    // Join user to a room for broadcasting
    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`[WebSocket] ${socket.id} joined room: ${room}`);
    });

    // Listen for tutoria updates
    socket.on('tutoria-created', (data: any) => {
      console.log(`[WebSocket] Tutoria created:`, data);
      io?.emit('tutoria-updated', { type: 'created', data });
    });

    socket.on('tutoria-updated', (data: any) => {
      console.log(`[WebSocket] Tutoria updated:`, data);
      io?.emit('tutoria-updated', { type: 'updated', data });
    });

    socket.on('tutoria-deleted', (data: any) => {
      console.log(`[WebSocket] Tutoria deleted:`, data);
      io?.emit('tutoria-updated', { type: 'deleted', data });
    });

    // Listen for configuration updates
    socket.on('config-updated', (data: any) => {
      console.log(`[WebSocket] Config updated:`, data);
      io?.emit('config-updated', data);
    });

    // Listen for feedback updates
    socket.on('feedback-created', (data: any) => {
      console.log(`[WebSocket] Feedback created:`, data);
      io?.emit('feedback-updated', { type: 'created', data });
    });

    // Listen for check-in updates
    socket.on('checkin-created', (data: any) => {
      console.log(`[WebSocket] Check-in created:`, data);
      io?.emit('checkin-updated', { type: 'created', data });
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] User disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getWebSocket(): SocketIOServer | null {
  return io;
}

export function broadcastTutoriaUpdate(type: 'created' | 'updated' | 'deleted', data: any) {
  if (io) {
    io.emit('tutoria-updated', { type, data });
  }
}

export function broadcastConfigUpdate(data: any) {
  if (io) {
    io.emit('config-updated', data);
  }
}

export function broadcastFeedbackUpdate(type: 'created' | 'updated', data: any) {
  if (io) {
    io.emit('feedback-updated', { type, data });
  }
}

export function broadcastCheckinUpdate(type: 'created' | 'updated', data: any) {
  if (io) {
    io.emit('checkin-updated', { type, data });
  }
}
