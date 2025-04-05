import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';

import globalErrorHandler from './middlewares/GlobalErrorhandler';
import responseMessage from './constant/responseMessage'; // Fixed typo
import httpError from './utils/httpError';
import authRoutes from './routes/auth.routes'; // Make sure this exists
// import sendNotificationToUser from './utils/sendNotification'; // You referenced it

dotenv.config();

const app: Application = express();
const server = createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Change in production
    methods: ["GET", "POST"],
  },
});

// Store connected users
const users: Record<string, string> = {}; // userId -> socketId

// io.on("connection", (socket: Socket) => {
//   console.log("🔌 User connected:", socket.id);

//   socket.on("register", (userId: string) => {
//     users[userId] = socket.id;
//     console.log(`✅ User ${userId} registered with socket ID: ${socket.id}`);
//   });

//   socket.on("send_notification", async ({ userId, message }: { userId: string; message: string }) => {
//     await sendNotificationToUser(userId, message);
//     const recipientSocketId = users[userId];
//     if (recipientSocketId) {
//       io.to(recipientSocketId).emit("receive_notification", { message });
//     }
//   });

//   socket.on("disconnect", () => {
//     const userId = Object.keys(users).find((key) => users[key] === socket.id);
//     if (userId) delete users[userId];
//     console.log("❌ User disconnected:", socket.id);
//   });
// });

// Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../', 'public')));

// Routes
app.get('/', (_: Request, res: Response) => {
  res.status(200).json({ message: '🚀 Welcome to the Mood-meal Backend API' });
});

app.use('/api/v1/auth', authRoutes); // Make sure this route exists

// 404 Handler
app.use((req: Request, _: Response, next: NextFunction) => {
  try {
    throw new Error(responseMessage.NOT_FOUND('route'));
  } catch (err) {
    httpError(next, err, req, 404);
  }
});

// Global error handler
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export { app, io };
