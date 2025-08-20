const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await query(
      'SELECT id, email, firebase_uid, username, subscription_status, catches_count FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user to request object
    req.user = userResult.rows[0];
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await query(
      'SELECT id, email, firebase_uid, username, subscription_status, catches_count FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0) {
      req.user = userResult.rows[0];
      req.userId = decoded.userId;
    }
    
    next();
  } catch (error) {
    // Ignore auth errors in optional auth
    next();
  }
};

// Check if user has premium subscription
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.subscription_status !== 'premium' && req.user.subscription_status !== 'pro') {
    return res.status(403).json({ 
      error: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED'
    });
  }

  next();
};

// Check catch limits for free users
const checkCatchLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Premium users have no limits
    if (req.user.subscription_status === 'premium' || req.user.subscription_status === 'pro') {
      return next();
    }

    // Check current month's catch count for free users
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const catchCountResult = await query(
      `SELECT COUNT(*) as count 
       FROM catches 
       WHERE user_id = $1 AND created_at >= $2`,
      [req.user.id, currentMonth]
    );

    const currentCatchCount = parseInt(catchCountResult.rows[0].count);
    const freeLimit = 10; // Free tier limit

    if (currentCatchCount >= freeLimit) {
      return res.status(403).json({
        error: 'Monthly catch limit reached. Upgrade to Pro for unlimited catches.',
        code: 'CATCH_LIMIT_EXCEEDED',
        current_count: currentCatchCount,
        limit: freeLimit
      });
    }

    // Add remaining catches to request
    req.remainingCatches = freeLimit - currentCatchCount;
    next();
  } catch (error) {
    console.error('Check catch limit error:', error);
    res.status(500).json({ 
      error: 'Error checking catch limit',
      code: 'LIMIT_CHECK_ERROR'
    });
  }
};

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(key)) {
      requests.set(key, requests.get(key).filter(time => time > windowStart));
    }

    // Get current request count
    const requestCount = requests.get(key)?.length || 0;

    if (requestCount >= max) {
      return res.status(429).json({
        error: message || 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    requests.get(key).push(now);

    next();
  };
};

// Auth rate limits
const loginRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts. Please try again later.'
);

const registerRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts
  'Too many registration attempts. Please try again later.'
);

module.exports = {
  verifyToken,
  optionalAuth,
  requirePremium,
  checkCatchLimit,
  generateTokens,
  verifyRefreshToken,
  loginRateLimit,
  registerRateLimit
};