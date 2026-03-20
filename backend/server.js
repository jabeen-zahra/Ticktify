const express    = require('express');
const dotenv     = require('dotenv');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// ── CORS — must be before all routes ─────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ];
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cookie'],
}));

// Handle preflight requests (Express v5 syntax)
app.options(/(.*)/, cors());

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Tictify API is running 🚀',
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./src/routes/authRoutes'));
app.use('/api/opportunities', require('./src/routes/opportunityRoutes'));
app.use('/api/bookmarks',     require('./src/routes/bookmarkRoutes'));
app.use('/api/users',         require('./src/routes/userRoutes'));
app.use('/api/admin',         require('./src/routes/adminRoutes'));
app.use('/api/student',      require('./src/routes/studentRoutes'));
app.use('/api/organizer',     require('./src/routes/organizerRoutes'));
app.use('/api/student',       require('./src/routes/studentRoutes'));
app.use('/api/student',       require('./src/routes/studentRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Tictify API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
});
