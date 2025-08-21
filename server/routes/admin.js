const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/roleAuth');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'markyourfish',
  user: process.env.DB_USER || 'myf_user',
  password: process.env.DB_PASSWORD || 'myf_password'
});

// GET /api/admin/users - Get all users (admin only)
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = 'WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1';
      params = [`%${search}%`, limit, offset];
    } else {
      params = [limit, offset];
    }
    
    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      search ? [`%${search}%`] : []
    );
    
    // Get users (excluding sensitive data)
    const usersResult = await pool.query(
      `SELECT 
         id, email, first_name, last_name, display_name, username,
         role, account_status, is_verified,
         subscription_plan, subscription_tier, catches_count,
         created_at, last_login_at
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${search ? 2 : 1} OFFSET $${search ? 3 : 2}`,
      params
    );
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      users: usersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/stats - Get system statistics (admin only)  
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    // Simple queries to avoid SQL errors
    const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const catchesResult = await pool.query('SELECT COUNT(*) as total_catches FROM catches');
    const subscriptionsResult = await pool.query(`
      SELECT subscription_plan, COUNT(*) as count 
      FROM users 
      GROUP BY subscription_plan
    `);
    
    // Build subscription object
    const subscriptions = {};
    subscriptionsResult.rows.forEach(row => {
      subscriptions[row.subscription_plan] = parseInt(row.count);
    });
    
    res.json({
      users: {
        total_users: parseInt(usersResult.rows[0].total_users),
        admin_count: 0,
        active_users: parseInt(usersResult.rows[0].total_users),
        new_users_30d: 0
      },
      catches: {
        total_catches: parseInt(catchesResult.rows[0].total_catches),
        catches_30d: 0,
        avg_weight: 0,
        active_anglers: 0
      },
      subscriptions,
      recentActivity: []
    });
    
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:id/role - Update user role (admin only)
router.put('/users/:id/role', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['angler', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (angler or admin)' });
    }
    
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, role',
      [role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:id/status - Update user account status (admin only)
router.put('/users/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { account_status } = req.body;
    
    if (!account_status || !['active', 'suspended', 'deactivated'].includes(account_status)) {
      return res.status(400).json({ 
        error: 'Valid account_status is required (active, suspended, or deactivated)' 
      });
    }
    
    const result = await pool.query(
      'UPDATE users SET account_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, account_status',
      [account_status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User account status updated successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Admin update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;