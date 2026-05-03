const express      = require('express');
const dotenv       = require('dotenv');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

dotenv.config();

// ── Validate required env variables on startup ───────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'MONGO_URI'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

connectDB();

const app = express();

// ── Trust proxy for rate limiter when behind Nginx / cloud load balancer ──────
app.set('trust proxy', 1);

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    }
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.options(/(.*)/, cors());

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

// ── HTTP Request Logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── MongoDB Injection Sanitization ────────────────────────────────────────────
app.use(mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized potential injection in field: ${key} from ${req.ip}`);
  },
}));

// ── Global Rate Limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// ── Strict Auth Rate Limiter ──────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    15,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' },
});

app.use('/api/', globalLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    message: 'Ticktify API is running 🚀',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, require('./src/routes/authRoutes'));
app.use('/api/opportunities', require('./src/routes/opportunityRoutes'));
app.use('/api/bookmarks',     require('./src/routes/bookmarkRoutes'));
app.use('/api/users',         require('./src/routes/userRoutes'));
app.use('/api/admin',         require('./src/routes/adminRoutes'));
app.use('/api/organizer',     require('./src/routes/organizerRoutes'));
app.use('/api/student',       require('./src/routes/studentRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// ── Error Handling (MUST be last) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Ticktify API running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;