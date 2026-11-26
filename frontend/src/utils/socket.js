import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token) => {
  if (!token) return socket;
  if (socket && socket.auth?.token !== token) {
    try { socket.disconnect(); } catch (e) {}
    socket = null;
  }
  if (!socket || !socket.connected) {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });
    socket.on('connect_error', (err) => {
      console.warn('Realtime connection note:', err.message);
    });
  }
  return socket;
};
