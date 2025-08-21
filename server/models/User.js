const { query, transaction } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.username = userData.username;
    this.password = userData.password;
    
    // Role and account status
    this.role = userData.role || 'angler';
    this.account_status = userData.account_status || 'active';
    this.is_verified = userData.is_verified || false;
    
    // Enhanced subscription system
    this.subscription_plan = userData.subscription_plan || 'free';
    this.subscription_tier = userData.subscription_tier || 1;
    this.subscription_expires_at = userData.subscription_expires_at;
    this.subscription_start_date = userData.subscription_start_date;
    this.trial_ends_at = userData.trial_ends_at;
    this.stripe_customer_id = userData.stripe_customer_id;
    this.catch_limit_monthly = userData.catch_limit_monthly || 5;
    
    // Profile fields
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.display_name = userData.display_name;
    this.bio = userData.bio;
    this.profile_picture_url = userData.profile_picture_url;
    
    // Privacy settings
    this.is_profile_public = userData.is_profile_public || false;
    this.show_location_on_catches = userData.show_location_on_catches || false;
    this.show_catch_stats = userData.show_catch_stats !== false; // Default true
    
    // Preferences
    this.preferred_units = userData.preferred_units || 'imperial';
    this.theme_preference = userData.theme_preference || 'auto';
    
    // Analytics
    this.last_login_at = userData.last_login_at;
    this.total_fishing_days = userData.total_fishing_days || 0;
    this.biggest_catch_weight = userData.biggest_catch_weight;
    this.biggest_catch_species = userData.biggest_catch_species;
    
    // System fields
    this.catches_count = userData.catches_count || 0;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Create new user
  static async create(userData) {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        username,
        role = 'angler',
        subscription_plan = 'free'
      } = userData;

      const result = await query(
        `INSERT INTO users (email, password, first_name, last_name, username, role, subscription_plan, subscription_tier, catch_limit_monthly, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [email, password, first_name, last_name, username, role, subscription_plan, 1, 5, false]
      );

      return new User(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
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

  // Check if user has permission for a specific action
  hasPermission(requiredRole) {
    const roleLevels = { angler: 1, admin: 2 };
    const userLevel = roleLevels[this.role] || 0;
    const requiredLevel = roleLevels[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }
  
  // Check subscription tier access
  hasSubscriptionAccess(requiredTier) {
    const tierMap = { free: 1, pro: 2, master: 3 };
    const userTier = tierMap[this.subscription_plan] || 1;
    const required = tierMap[requiredTier] || 1;
    
    return userTier >= required;
  }

  // Update user
  async update(updateData) {
    try {
      const allowedFields = [
        'username', 'email', 'first_name', 'last_name', 'display_name', 'bio',
        'profile_picture_url', 'is_profile_public', 'show_location_on_catches',
        'show_catch_stats', 'preferred_units', 'theme_preference',
        'subscription_plan', 'subscription_tier', 'subscription_expires_at',
        'subscription_start_date', 'trial_ends_at', 'stripe_customer_id',
        'catch_limit_monthly', 'account_status', 'is_verified'
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
    if (this.subscription_plan === 'free') {
      return true; // Free accounts are always "active"
    }

    if (!this.subscription_expires_at) {
      return false;
    }

    return new Date(this.subscription_expires_at) > new Date();
  }
  
  // Check if user can log more catches
  canLogCatch() {
    if (this.subscription_plan === 'pro' || this.subscription_plan === 'master') {
      return true; // Unlimited for paid tiers
    }
    
    return this.catches_count < this.catch_limit_monthly;
  }
  
  // Get remaining catch allowance for free tier
  getRemainingCatches() {
    if (this.subscription_plan === 'pro' || this.subscription_plan === 'master') {
      return null; // Unlimited
    }
    
    return Math.max(0, this.catch_limit_monthly - this.catches_count);
  }

  // Get subscription info
  getSubscriptionInfo() {
    return {
      plan: this.subscription_plan,
      tier: this.subscription_tier,
      expires_at: this.subscription_expires_at,
      start_date: this.subscription_start_date,
      trial_ends_at: this.trial_ends_at,
      is_active: this.isSubscriptionActive(),
      can_log_catch: this.canLogCatch(),
      catches_limit: this.subscription_plan === 'free' ? this.catch_limit_monthly : null,
      remaining_catches: this.getRemainingCatches(),
      current_catches: this.catches_count,
      stripe_customer_id: this.stripe_customer_id
    };
  }

  // Convert to JSON (remove sensitive data)
  toJSON() {
    const {
      password,
      stripe_customer_id,
      ...publicData
    } = this;

    return {
      ...publicData,
      subscription_info: this.getSubscriptionInfo()
    };
  }
}

module.exports = User;