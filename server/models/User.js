const { query, transaction } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.firebase_uid = userData.firebase_uid;
    this.username = userData.username;
    this.subscription_status = userData.subscription_status || 'free';
    this.subscription_expires_at = userData.subscription_expires_at;
    this.catches_count = userData.catches_count || 0;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Create new user
  static async create(userData) {
    try {
      const {
        email,
        firebase_uid,
        username,
        password_hash,
        subscription_status = 'free'
      } = userData;

      const result = await query(
        `INSERT INTO users (email, firebase_uid, username, subscription_status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [email, firebase_uid, username, subscription_status]
      );

      return new User(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        }
        if (error.constraint === 'users_firebase_uid_key') {
          throw new Error('Firebase UID already exists');
        }
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by Firebase UID
  static async findByFirebaseUid(firebaseUid) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );

      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async update(updateData) {
    try {
      const allowedFields = [
        'username', 'email', 'subscription_status', 
        'subscription_expires_at'
      ];

      const updates = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          updates.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
          paramCount++;
        }
      });

      if (updates.length === 0) {
        return this;
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(this.id);

      const result = await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Update catches count
  async updateCatchesCount() {
    try {
      const result = await query(
        'SELECT COUNT(*) as count FROM catches WHERE user_id = $1',
        [this.id]
      );

      const newCount = parseInt(result.rows[0].count);

      await query(
        'UPDATE users SET catches_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newCount, this.id]
      );

      this.catches_count = newCount;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  async getStatistics() {
    try {
      const [
        catchesResult,
        speciesResult,
        recentResult,
        monthlyResult
      ] = await Promise.all([
        // Total catches
        query(
          'SELECT COUNT(*) as total FROM catches WHERE user_id = $1',
          [this.id]
        ),
        // Species count
        query(
          `SELECT COUNT(DISTINCT COALESCE(s.name, c.species_other)) as species_count
           FROM catches c
           LEFT JOIN species s ON c.species_id = s.id
           WHERE c.user_id = $1`,
          [this.id]
        ),
        // Recent catches (last 30 days)
        query(
          `SELECT COUNT(*) as recent_count
           FROM catches
           WHERE user_id = $1 AND catch_date >= CURRENT_DATE - INTERVAL '30 days'`,
          [this.id]
        ),
        // Current month catches
        query(
          `SELECT COUNT(*) as monthly_count
           FROM catches
           WHERE user_id = $1 
           AND EXTRACT(MONTH FROM catch_date) = EXTRACT(MONTH FROM CURRENT_DATE)
           AND EXTRACT(YEAR FROM catch_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
          [this.id]
        )
      ]);

      return {
        total_catches: parseInt(catchesResult.rows[0].total),
        unique_species: parseInt(speciesResult.rows[0].species_count),
        recent_catches: parseInt(recentResult.rows[0].recent_count),
        monthly_catches: parseInt(monthlyResult.rows[0].monthly_count)
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user's catches with pagination
  async getCatches(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        species_filter,
        date_from,
        date_to,
        sort_by = 'catch_date',
        sort_order = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      let whereConditions = ['c.user_id = $1'];
      let params = [this.id];
      let paramCount = 2;

      // Add filters
      if (species_filter) {
        whereConditions.push(`(s.name = $${paramCount} OR c.species_other = $${paramCount})`);
        params.push(species_filter);
        paramCount++;
      }

      if (date_from) {
        whereConditions.push(`c.catch_date >= $${paramCount}`);
        params.push(date_from);
        paramCount++;
      }

      if (date_to) {
        whereConditions.push(`c.catch_date <= $${paramCount}`);
        params.push(date_to);
        paramCount++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total
         FROM catches c
         LEFT JOIN species s ON c.species_id = s.id
         ${whereClause}`,
        params
      );

      // Get catches
      const catchesResult = await query(
        `SELECT 
           c.*,
           s.name as species_name,
           s.color_code as species_color,
           l.name as lure_name,
           w.conditions, w.air_temp, w.wind_speed, w.wind_direction,
           w.lunar_phase, w.barometric_pressure, w.pressure_trend
         FROM catches c
         LEFT JOIN species s ON c.species_id = s.id
         LEFT JOIN lures l ON c.lure_id = l.id
         LEFT JOIN weather_data w ON c.id = w.catch_id
         ${whereClause}
         ORDER BY c.${sort_by} ${sort_order}
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...params, limit, offset]
      );

      return {
        catches: catchesResult.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
          pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete user and all related data
  async delete() {
    try {
      await transaction(async (client) => {
        // Delete in correct order due to foreign key constraints
        await client.query('DELETE FROM weather_data WHERE catch_id IN (SELECT id FROM catches WHERE user_id = $1)', [this.id]);
        await client.query('DELETE FROM photos WHERE catch_id IN (SELECT id FROM catches WHERE user_id = $1)', [this.id]);
        await client.query('DELETE FROM catches WHERE user_id = $1', [this.id]);
        await client.query('DELETE FROM users WHERE id = $1', [this.id]);
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Check subscription status
  isSubscriptionActive() {
    if (this.subscription_status === 'free') {
      return true; // Free accounts are always "active"
    }

    if (!this.subscription_expires_at) {
      return false;
    }

    return new Date(this.subscription_expires_at) > new Date();
  }

  // Get subscription info
  getSubscriptionInfo() {
    return {
      status: this.subscription_status,
      expires_at: this.subscription_expires_at,
      is_active: this.isSubscriptionActive(),
      catches_limit: this.subscription_status === 'free' ? 10 : null,
      current_catches: this.catches_count
    };
  }

  // Convert to JSON (remove sensitive data)
  toJSON() {
    const {
      id,
      email,
      username,
      subscription_status,
      subscription_expires_at,
      catches_count,
      created_at
    } = this;

    return {
      id,
      email,
      username,
      subscription_status,
      subscription_expires_at,
      catches_count,
      created_at,
      subscription_info: this.getSubscriptionInfo()
    };
  }
}

module.exports = User;