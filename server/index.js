import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './db.js';

// Import routes
import authRoutes from './routes/auth.js';
import guideRoutes from './routes/guides.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

app.set('io', io); // Make 'io' available inside routes via req.app.get('io')

// Socket connection handling
io.on('connection', (socket) => {
  console.log('⚡ User connected to socket:', socket.id);

  socket.on('join_booking', (bookingId) => {
    socket.join(bookingId);
    console.log(`User joined room: ${bookingId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket:', socket.id);
  });
});
// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // Connect to DB after server starts — failure won't crash the process
  await connectDB().catch(() => {});
});
