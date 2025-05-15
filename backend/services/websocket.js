const { Server } = require('socket.io');

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    // Handle user authentication
    socket.on('authenticate', (username) => {
      if (username) {
        socket.join(username);
        console.log(`User ${username} authenticated`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
};

module.exports = {
  initializeWebSocket,
  getIO
}; 