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
import authRoutes from './routes/auth.routes';
import seekerRoutes from "./routes/seeker.route"
import reviewRoutes from './routes/review.routes';
import ticketRoutes from './routes/ticketRoutes';
import profileRoutes from './routes/user.routes'
// import sendNotificationToUser from './utils/sendNotification'; // You referenced it
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import paymentRoutes from './routes/payment.routes';
import systemRoutes from './routes/system.routes';

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
  res.status(200).json({ message: '🚀 Welcome to the TatkalLink Backend API' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/seeker', seekerRoutes);
app.use('/api/v1/ticket', ticketRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1//notification', notificationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/system', systemRoutes);

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
