const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

// ── Load env vars ────────────────────────────────────────────────────────────
dotenv.config();

// ── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());                              // Security headers
app.use(morgan('dev'));                          // Request logging
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());                        // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());                        // Parse cookies

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./src/routes/authRoutes'));
app.use('/api/opportunities', require('./src/routes/opportunityRoutes'));
app.use('/api/bookmarks',     require('./src/routes/bookmarkRoutes'));
app.use('/api/users',         require('./src/routes/userRoutes'));
app.use('/api/admin',         require('./src/routes/adminRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tictify API is running 🚀', env: process.env.NODE_ENV });
});

// ── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Tictify API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
});
