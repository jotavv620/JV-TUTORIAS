import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { trpc } from '@/lib/trpc';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Connected:', socket.id);
      socket.emit('join-room', 'tutoria-manager');
    });

    // Listen for tutoria updates
    socket.on('tutoria-updated', (message: any) => {
      console.log('[WebSocket] Tutoria update received:', message);
      // Invalidate tutorias query to refetch
      utils.tutorias.list.invalidate();
    });

    // Listen for config updates
    socket.on('config-updated', (data: any) => {
      console.log('[WebSocket] Config update received:', data);
      // Invalidate config queries
      utils.config.getDisciplinas.invalidate();
      utils.config.getProfessores.invalidate();
      utils.config.getInstituicoes.invalidate();
    });

    // Listen for feedback updates
    socket.on('feedback-updated', (message: any) => {
      console.log('[WebSocket] Feedback update received:', message);
      // Invalidate feedback queries
      utils.feedback.invalidate();
    });

    // Listen for check-in updates
    socket.on('checkin-updated', (message: any) => {
      console.log('[WebSocket] Check-in update received:', message);
      // Invalidate check-in queries
      utils.checkin.invalidate();
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    socket.on('error', (error: any) => {
      console.error('[WebSocket] Error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [utils]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { socket: socketRef.current, emit };
}
