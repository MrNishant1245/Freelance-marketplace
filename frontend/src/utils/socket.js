import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token) => {
  if (!token) return socket;
  if (socket && socket.auth?.token !== token) {
    try { socket.disconnect(); } catch (e) {}
    socket = null;
  }
  if (!socket || !socket.connected) {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};
