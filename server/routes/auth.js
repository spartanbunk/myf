const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { setCached, getCached, deleteCached } = require('../config/redis');
const router = express.Router();

// Database connection
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'markyourfish',
  user: process.env.DB_USER || 'myf_user',
  password: process.env.DB_PASSWORD || 'myf_password'
});

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists().withMessage('Password is required')
];

// Helper function to generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists in database
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database with password
    const result = await pool.query(
      'INSERT INTO users (email, password, firebase_uid, username) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, email, `${firstName} ${lastName}`]
    );
    const userId = result.rows[0].id;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId);

    // Store refresh token in Redis (7 days expiration)
    await setCached(`refresh_token:${userId}`, refreshToken, 7 * 24 * 60 * 60);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        firstName,
        lastName
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Get user from database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in Redis (7 days expiration)
    await setCached(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

    // Parse username to get first and last name if not set individually
    const nameParts = user.username ? user.username.split(' ') : ['', ''];
    const firstName = user.first_name || nameParts[0] || '';
    const lastName = user.last_name || nameParts.slice(1).join(' ') || '';

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
        accountStatus: user.account_status,
        subscriptionPlan: user.subscription_plan,
        subscriptionTier: user.subscription_tier,
        catchesCount: user.catches_count,
        isProfilePublic: user.is_profile_public
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
    
    // Check if refresh token exists in Redis
    const storedToken = await getCached(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens (token rotation)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Update refresh token in Redis (7 days expiration)
    await setCached(`refresh_token:${decoded.userId}`, newRefreshToken, 7 * 24 * 60 * 60);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Verify and decode token to get user ID
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
        
        // Remove refresh token from Redis
        await deleteCached(`refresh_token:${decoded.userId}`);
        console.log(`Refresh token revoked for user ${decoded.userId}`);
        
      } catch (error) {
        // Token is invalid, but we still want to respond with success
        console.log('Invalid refresh token during logout:', error.message);
      }
    }

    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - Get current user info (requires authentication)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from database with all relevant fields
    const result = await pool.query(
      `SELECT id, email, username, first_name, last_name, display_name,
              role, account_status, subscription_plan, subscription_tier,
              catches_count, is_profile_public
       FROM users WHERE id = $1 AND account_status = 'active'`, 
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];

    // Parse username to get first and last name if not set individually
    const nameParts = user.username ? user.username.split(' ') : ['', ''];
    const firstName = user.first_name || nameParts[0] || '';
    const lastName = user.last_name || nameParts.slice(1).join(' ') || '';

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
        accountStatus: user.account_status,
        subscriptionPlan: user.subscription_plan,
        subscriptionTier: user.subscription_tier,
        catchesCount: user.catches_count,
        isProfilePublic: user.is_profile_public
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }
    
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;