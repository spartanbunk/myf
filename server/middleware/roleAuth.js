const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'markyourfish',
  user: process.env.DB_USER || 'myf_user',
  password: process.env.DB_PASSWORD || 'myf_password'
});

// Middleware to verify JWT token and load user data
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from database with all fields
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND account_status = $2',
      [decoded.userId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or account inactive' });
    }

    const user = result.rows[0];
    
    // Attach user to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to check user role
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const roleLevels = { angler: 1, admin: 2 };
    const userLevel = roleLevels[req.user.role] || 0;
    const requiredLevel = roleLevels[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredRole,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check subscription tier
const requireSubscription = (requiredTier) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tierLevels = { free: 1, pro: 2, master: 3 };
    const userTier = tierLevels[req.user.subscription_plan] || 1;
    const required = tierLevels[requiredTier] || 1;

    if (userTier < required) {
      return res.status(403).json({
        error: 'Subscription upgrade required',
        requiredTier,
        currentTier: req.user.subscription_plan,
        upgradeUrl: '/subscription/upgrade'
      });
    }

    next();
  };
};

// Middleware to check catch limit for free tier users
const checkCatchLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Pro and Master tiers have unlimited catches
    if (req.user.subscription_plan === 'pro' || req.user.subscription_plan === 'master') {
      return next();
    }

    // Check if free tier user has exceeded limit
    if (req.user.catches_count >= req.user.catch_limit_monthly) {
      return res.status(403).json({
        error: 'Monthly catch limit exceeded',
        limit: req.user.catch_limit_monthly,
        current: req.user.catches_count,
        upgradeMessage: 'Upgrade to Pro for unlimited catches',
        upgradeUrl: '/subscription/upgrade'
      });
    }

    next();
  } catch (error) {
    console.error('Catch limit check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token provided, continue without user
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND account_status = $2',
        [decoded.userId, 'active']
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
        req.userId = result.rows[0].id;
      }
    } catch (jwtError) {
      console.log('Invalid token in optional auth:', jwtError.message);
      // Continue without setting user
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue on error for optional auth
  }
};

// Middleware to check if user owns a resource
const requireOwnership = (resourceIdParam = 'id', resourceTable = 'catches') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({ error: `${resourceIdParam} parameter is required` });
      }

      // Check if resource belongs to user
      const result = await pool.query(
        `SELECT user_id FROM ${resourceTable} WHERE id = $1`,
        [resourceId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      const resourceUserId = result.rows[0].user_id;
      
      // Allow if user owns the resource OR if user is admin
      if (resourceUserId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied - resource not owned by user' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSubscription,
  checkCatchLimit,
  optionalAuth,
  requireOwnership
};