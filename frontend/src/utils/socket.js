import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token) => {
  if (!socket || !socket.connected) {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};
