const dotenv = require('dotenv');
const http = require('http'); // 1. HTTP module import karein
const { Server } = require('socket.io'); // 2. Socket.io import karein

// Load environment variables
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// 3. HTTP Server create karein Express app ke sath
const server = http.createServer(app);

// 4. Socket.io instance initialize karein aur CORS set karein
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// 5. Global variable ya app me `io` assign karein taaki controllers me use ho sake
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    await connectDB();

    // 6. app.listen ki jagah server.listen use karein
    server.listen(PORT, () => {
      console.log(`[Server] WinVest Advisory Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection] ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error(`[Uncaught Exception] ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`[Fatal Startup Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();

// idr se old
// const dotenv = require('dotenv');
// const http = require('http'); // 1. http module import karo
// const { Server } = require('socket.io'); // 2. socket.io import karo

// // Load environment variables
// dotenv.config();

// const app = require('./app');
// const connectDB = require('./config/db');

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();

//     // 3. HTTP Server banao
//     const server = http.createServer(app);

//     // 4. Socket.IO initialize karo (CORS ke saath)
//     const io = new Server(server, {
//       cors: {
//         origin: process.env.CORS_ORIGIN || '*',
//         methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
//       }
//     });

//     // 5. Express app me io instance set karo
//     app.set('io', io);

//     // 6. Client connection listen karo
//     io.on('connection', (socket) => {
//       console.log(`[Socket] Client connected: ${socket.id}`);

//       socket.on('disconnect', () => {
//         console.log(`[Socket] Client disconnected: ${socket.id}`);
//       });
//     });

//     server.listen(PORT, () => {
//       console.log(`[Server] WinVest Advisory Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
//     });

//     // Handle unhandled promise rejections
//     process.on('unhandledRejection', (err) => {
//       console.error(`[Unhandled Rejection] ${err.message}`);
//       server.close(() => process.exit(1));
//     });

//     // Handle uncaught exceptions
//     process.on('uncaughtException', (err) => {
//       console.error(`[Uncaught Exception] ${err.message}`);
//       process.exit(1);
//     });
//   } catch (error) {
//     console.error(`[Fatal Startup Error] ${error.message}`);
//     process.exit(1);
//   }
// };

// startServer();