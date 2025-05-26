const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const compression = require('compression');

// Load environment variables
dotenv.config();

// Validate essential environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
requiredEnvVars.forEach(env => {
  if (!process.env[env]) throw new Error(`${env} environment variable is required`);
});

// Route imports
const companyRoutes = require('./routes/company');
const customerRoutes = require('./routes/customer');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat'); // <-- Chat routes

const app = express();
const httpServer = createServer(app);

// ========================
//      Security Middleware
// ========================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ========================
//      Rate Limiting
// ========================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later'
});

// ========================
//      Core Middleware
// ========================
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --- Custom MongoDB Injection Sanitization ---
app.use((req, _, next) => {
  const sanitizeInput = (obj) => {
    if (!obj) return;
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      }
    });
  };
  sanitizeInput(req.query);
  sanitizeInput(req.body);
  next();
});

app.use(morgan('dev'));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// ========================
//      Database Setup
// ========================
mongoose.set('strictQuery', true);
mongoose.set('debug', true);

const connectWithRetry = () => {
  console.log('Attempting MongoDB connection to:', process.env.MONGO_URI);
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

mongoose.connection.on('connected', () => console.log('[MONGOOSE] Connected'));
mongoose.connection.on('open', () => console.log('[MONGOOSE] Connection open'));
mongoose.connection.on('error', err => console.error('[MONGOOSE] Error:', err));
mongoose.connection.on('disconnected', () => console.log('[MONGOOSE] Disconnected'));
mongoose.connection.on('reconnected', () => console.log('[MONGOOSE] Reconnected'));

// ========================
//      Route Handling
// ========================
app.use('/api/companies', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes); // <-- Chat route added

// ========================
//      Health Checks
// ========================
app.get('/health', (req, res) => res.json({
  status: 'ok',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  env: process.env.NODE_ENV || 'development',
  memory: process.memoryUsage()
}));

// ========================
//      Error Handling
// ========================
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================
//      Graceful Shutdown
// ========================
const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  await mongoose.connection.close();
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ========================
//      Server Startup
// ========================
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
