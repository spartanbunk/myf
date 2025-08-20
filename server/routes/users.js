const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock database connection - replace with actual database connection
// const db = require('../config/database');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};

// Validation middleware
const validateProfileUpdate = [
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format')
];

const validatePasswordChange = [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
];

// GET /api/users/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // TODO: Get user from database
    // const result = await db.query(`
    //   SELECT id, email, first_name, last_name, phone, bio, location, date_of_birth, 
    //          profile_picture_url, created_at, updated_at, is_premium, subscription_expires_at
    //   FROM users WHERE id = $1
    // `, [req.userId]);
    
    // if (result.rows.length === 0) {
    //   return res.status(404).json({ error: 'User not found' });
    // }
    
    // const user = result.rows[0];

    // Mock user data for now
    const user = {
      id: req.userId,
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
      bio: 'Passionate angler who loves exploring new fishing spots.',
      location: 'Michigan, USA',
      date_of_birth: '1990-05-15',
      profile_picture_url: 'https://example.com/profile.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      is_premium: false,
      subscription_expires_at: null
    };

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        dateOfBirth: user.date_of_birth,
        profilePictureUrl: user.profile_picture_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        isPremium: user.is_premium,
        subscriptionExpiresAt: user.subscription_expires_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const updateFields = {};
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'bio', 'location', 'dateOfBirth'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Convert camelCase to snake_case for database
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields[dbField] = req.body[field];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // If email is being updated, check if it's already taken
    if (updateFields.email) {
      // TODO: Check if email already exists
      // const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [updateFields.email, req.userId]);
      // if (emailCheck.rows.length > 0) {
      //   return res.status(409).json({ error: 'Email already in use' });
      // }
    }

    // TODO: Update user in database
    // const setClause = Object.keys(updateFields).map((field, index) => `${field} = $${index + 2}`).join(', ');
    // const values = Object.values(updateFields);
    // const result = await db.query(
    //   `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING 
    //    id, email, first_name, last_name, phone, bio, location, date_of_birth, 
    //    profile_picture_url, created_at, updated_at, is_premium, subscription_expires_at`,
    //   [req.userId, ...values]
    // );
    // const updatedUser = result.rows[0];

    // Mock updated user for now
    const updatedUser = {
      id: req.userId,
      email: updateFields.email || 'user@example.com',
      first_name: updateFields.first_name || 'John',
      last_name: updateFields.last_name || 'Doe',
      phone: updateFields.phone || '+1234567890',
      bio: updateFields.bio || 'Passionate angler who loves exploring new fishing spots.',
      location: updateFields.location || 'Michigan, USA',
      date_of_birth: updateFields.date_of_birth || '1990-05-15',
      profile_picture_url: 'https://example.com/profile.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
      is_premium: false,
      subscription_expires_at: null
    };

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        location: updatedUser.location,
        dateOfBirth: updatedUser.date_of_birth,
        profilePictureUrl: updatedUser.profile_picture_url,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
        isPremium: updatedUser.is_premium,
        subscriptionExpiresAt: updatedUser.subscription_expires_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/password - Change user password
router.put('/password', authenticateToken, validatePasswordChange, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // TODO: Get current password hash from database
    // const result = await db.query('SELECT password FROM users WHERE id = $1', [req.userId]);
    // if (result.rows.length === 0) {
    //   return res.status(404).json({ error: 'User not found' });
    // }
    // const currentPasswordHash = result.rows[0].password;

    // Verify current password
    // const isValidPassword = await bcrypt.compare(currentPassword, currentPasswordHash);
    // if (!isValidPassword) {
    //   return res.status(400).json({ error: 'Current password is incorrect' });
    // }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // TODO: Update password in database
    // await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, req.userId]);

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/profile-picture - Update profile picture URL
router.put('/profile-picture', authenticateToken, [
  body('profilePictureUrl').isURL().withMessage('Invalid URL format')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { profilePictureUrl } = req.body;

    // TODO: Update profile picture URL in database
    // await db.query('UPDATE users SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2', 
    //   [profilePictureUrl, req.userId]);

    res.json({
      message: 'Profile picture updated successfully',
      profilePictureUrl
    });

  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/account - Delete user account
router.delete('/account', authenticateToken, [
  body('password').exists().withMessage('Password is required to delete account'),
  body('confirmDelete').equals('DELETE').withMessage('Must type DELETE to confirm account deletion')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { password } = req.body;

    // TODO: Get user and verify password
    // const result = await db.query('SELECT password FROM users WHERE id = $1', [req.userId]);
    // if (result.rows.length === 0) {
    //   return res.status(404).json({ error: 'User not found' });
    // }
    // const passwordHash = result.rows[0].password;

    // Verify password
    // const isValidPassword = await bcrypt.compare(password, passwordHash);
    // if (!isValidPassword) {
    //   return res.status(400).json({ error: 'Incorrect password' });
    // }

    // TODO: Delete user and all related data (use transaction)
    // await db.query('BEGIN');
    // try {
    //   await db.query('DELETE FROM catches WHERE user_id = $1', [req.userId]);
    //   await db.query('DELETE FROM users WHERE id = $1', [req.userId]);
    //   await db.query('COMMIT');
    // } catch (error) {
    //   await db.query('ROLLBACK');
    //   throw error;
    // }

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/preferences - Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    // TODO: Get user preferences from database
    // const result = await db.query(`
    //   SELECT units, timezone, privacy_settings, notification_settings
    //   FROM user_preferences WHERE user_id = $1
    // `, [req.userId]);

    // Mock preferences for now
    const preferences = {
      units: 'imperial', // imperial or metric
      timezone: 'America/New_York',
      privacySettings: {
        profileVisibility: 'public', // public, friends, private
        showCatches: true,
        showLocation: false,
        showStats: true
      },
      notificationSettings: {
        emailNotifications: true,
        weatherAlerts: true,
        marketingEmails: false,
        catchReminders: true
      }
    };

    res.json({ preferences });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', authenticateToken, [
  body('units').optional().isIn(['imperial', 'metric']).withMessage('Units must be imperial or metric'),
  body('timezone').optional().isLength({ min: 1 }).withMessage('Invalid timezone'),
  body('privacySettings').optional().isObject().withMessage('Privacy settings must be an object'),
  body('notificationSettings').optional().isObject().withMessage('Notification settings must be an object')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { units, timezone, privacySettings, notificationSettings } = req.body;

    // TODO: Update or insert preferences in database
    // await db.query(`
    //   INSERT INTO user_preferences (user_id, units, timezone, privacy_settings, notification_settings, updated_at)
    //   VALUES ($1, $2, $3, $4, $5, NOW())
    //   ON CONFLICT (user_id) 
    //   DO UPDATE SET 
    //     units = COALESCE($2, user_preferences.units),
    //     timezone = COALESCE($3, user_preferences.timezone),
    //     privacy_settings = COALESCE($4, user_preferences.privacy_settings),
    //     notification_settings = COALESCE($5, user_preferences.notification_settings),
    //     updated_at = NOW()
    // `, [req.userId, units, timezone, JSON.stringify(privacySettings), JSON.stringify(notificationSettings)]);

    res.json({ message: 'Preferences updated successfully' });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/activity - Get user activity feed
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    // TODO: Get user activity from database
    // const result = await db.query(`
    //   SELECT activity_type, data, created_at 
    //   FROM user_activity 
    //   WHERE user_id = $1 
    //   ORDER BY created_at DESC 
    //   LIMIT 50
    // `, [req.userId]);

    // Mock activity data for now
    const activities = [
      {
        type: 'catch_added',
        data: {
          species: 'Bass',
          location: 'Lake Michigan'
        },
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        type: 'profile_updated',
        data: {
          field: 'bio'
        },
        createdAt: '2024-01-14T14:20:00Z'
      },
      {
        type: 'subscription_purchased',
        data: {
          plan: 'premium'
        },
        createdAt: '2024-01-10T09:15:00Z'
      }
    ];

    res.json({ activities });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;