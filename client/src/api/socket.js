import { io } from 'socket.io-client';

// Use same origin for socket connection, Vite will proxy it to 5000 in dev
// and it will work automatically on the same port in production.
export const socket = io();

export default socket;
