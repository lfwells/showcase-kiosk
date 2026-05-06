import { io } from 'socket.io-client';

// Use same host for dev and production
const socketUrl = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3000';

export const socket = io(socketUrl, {
  autoConnect: true,
});
