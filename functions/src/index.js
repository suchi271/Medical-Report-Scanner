const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

admin.initializeApp();

const app = express();

/**
 * 🔑 IMPORTANT:
 * Do NOT use app.use(cors()) in Firebase v1.
 * CORS must wrap the function itself.
 */

// Body parser
app.use(express.json());

// ---------- Auth Middleware ----------
const verifyAuth = async (req, res, next) => {
  try {
    // 🔑 Allow preflight to pass
    if (req.method === 'OPTIONS') {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// ---------- Rate Limit ----------
const rateLimitMap = new Map();
const rateLimit = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const userId = req.user.uid;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;

  const entry = rateLimitMap.get(userId) || { count: 0, resetTime: now + windowMs };

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }

  if (entry.count >= maxRequests) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  entry.count++;
  rateLimitMap.set(userId, entry);
  next();
};

app.use(verifyAuth);
app.use(rateLimit);

// ---------- Routes ----------
app.post('/processReport', require('./extractLabData'));
app.post('/analyzeReport', require('./analyzeReport'));
app.post('/getTrends', require('./getTrends'));
app.post('/compareReports', require('./compareReports'));

// ---------- 🔑 CORS WRAPPED FUNCTION ----------
exports.api = functions.https.onRequest((req, res) => {
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })(req, res, () => {
    app(req, res);
  });
});
