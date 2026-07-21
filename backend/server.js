const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const dns        = require('dns');
const http       = require('http');          // ✅ NEW
const { Server } = require('socket.io');    // ✅ NEW
require('dotenv').config();

// Force Node.js to use Google DNS
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const authRoutes    = require('./routes/auth.routes');
const userRoutes    = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const paymentRoutes = require('./routes/payment.routes');
const jobRoutes     = require('./routes/job.routes');
const reviewRoutes  = require('./routes/review.routes');
const messageRoutes = require('./routes/message.routes'); // ✅ NEW
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { verifyAccessToken }      = require('./utils/jwt.utils'); // ✅ NEW

const app    = express();
app.set('trust proxy', 1);
const server = http.createServer(app); // ✅ NEW: wrap express in http server

// ─── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== 'production' || !origin) {
        return callback(null, true);
      }
      return callback(null, origin === (process.env.CLIENT_URL || 'http://localhost:3000'));
    },
    credentials: true,
  },
});

// Socket auth middleware — JWT verify on every connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = verifyAccessToken(token);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.userId}`);

  // Personal room (for notifications/unread badges)
  socket.join(`user:${socket.userId}`);

  // Join a conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Leave a conversation room
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Typing indicators
  socket.on('typing', ({ conversationId }) => {
    socket.to(conversationId).emit('userTyping', { userId: socket.userId });
  });
  socket.on('stopTyping', ({ conversationId }) => {
    socket.to(conversationId).emit('userStoppedTyping', { userId: socket.userId });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.userId}`);
  });
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ─────────────────────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== 'production';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isDev || !origin) {
      return callback(null, true);
    }
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    if (origin === clientUrl) return callback(null, true);
    return callback(new Error('CORS blocked'), false);
  },
  credentials: true,
}));

// Rate limiting — relaxed in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/payment',  paymentRoutes);
app.use('/api/jobs',     jobRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/messages', messageRoutes); // ✅ NEW

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // ✅ server.listen (not app.listen) — required for Socket.io to work
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`🔌 Socket.io ready`);
  });
});

module.exports = app;
