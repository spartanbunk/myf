const express = require('express');
const { body, query, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const router = express.Router();

// Configure multer for handling multipart form data (including file uploads)
const path = require('path');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/catches/');
    },
    filename: (req, file, cb) => {
      // Create unique filename with timestamp and original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Database connection
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'markyourfish',
  user: process.env.DB_USER || 'myf_user',
  password: process.env.DB_PASSWORD || 'myf_password'
});

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
const validateCatch = [
  body('species').trim().isLength({ min: 1 }).withMessage('Species is required'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('length').optional().isFloat({ min: 0 }).withMessage('Length must be a positive number'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
];

const validateCatchUpdate = [
  body('species').optional().trim().isLength({ min: 1 }).withMessage('Species cannot be empty'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('length').optional().isFloat({ min: 0 }).withMessage('Length must be a positive number'),
  body('location').optional().trim().isLength({ min: 1 }).withMessage('Location cannot be empty'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
];

// GET /api/catches - Get all catches for the authenticated user
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('species').optional().trim(),
  query('location').optional().trim(),
  query('sortBy').optional().isIn(['date', 'species', 'weight', 'length']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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

    const {
      page = 1,
      limit = 20,
      species,
      location,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    console.log('GET /catches - userId:', req.userId);

    // Build query with filters
    let query = 'SELECT * FROM catches WHERE user_id = $1';
    let params = [req.userId];
    let paramIndex = 2;
    
    if (species) {
      query += ` AND species ILIKE $${paramIndex}`;
      params.push(`%${species}%`);
      paramIndex++;
    }
    
    if (location) {
      query += ` AND location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    const totalResult = await pool.query('SELECT COUNT(*) FROM catches WHERE user_id = $1', [req.userId]);
    const total = parseInt(totalResult.rows[0].count);

    const totalPages = Math.ceil(total / limit);

    // Format catches to include coordinates object for frontend
    const formattedCatches = result.rows.map(catch_ => ({
      ...catch_,
      coordinates: {
        lat: parseFloat(catch_.latitude),
        lng: parseFloat(catch_.longitude)
      }
    }));

    res.json({
      catches: formattedCatches,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get catches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/catches/:id - Get a specific catch
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid catch ID' });
    }

    // TODO: Get catch from database
    // const result = await db.query('SELECT * FROM catches WHERE id = $1 AND user_id = $2', [id, req.userId]);
    // if (result.rows.length === 0) {
    //   return res.status(404).json({ error: 'Catch not found' });
    // }
    // const catch = result.rows[0];

    // Mock data for now
    if (id === '1') {
      const mockCatch = {
        id: 1,
        user_id: req.userId,
        species: 'Bass',
        weight: 2.5,
        length: 15.5,
        location: 'Lake Michigan',
        latitude: 42.3314,
        longitude: -87.9073,
        date: '2024-01-15T10:30:00Z',
        notes: 'Great fight!',
        photo_urls: ['https://example.com/photo1.jpg'],
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      };
      
      res.json({ catch: mockCatch });
    } else {
      res.status(404).json({ error: 'Catch not found' });
    }

  } catch (error) {
    console.error('Get catch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/catches - Create a new catch
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    // Manual validation for multipart form data
    const errors = [];
    
    if (!req.body.species || req.body.species.trim().length === 0) {
      errors.push({ field: 'species', message: 'Species is required' });
    }
    
    if (!req.body.location || req.body.location.trim().length === 0) {
      errors.push({ field: 'location', message: 'Location is required' });
    }
    
    if (!req.body.date) {
      errors.push({ field: 'date', message: 'Date is required' });
    } else {
      // Validate ISO date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!dateRegex.test(req.body.date)) {
        errors.push({ field: 'date', message: 'Invalid date format. Expected ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)' });
      }
    }
    
    if (req.body.weight && (isNaN(parseFloat(req.body.weight)) || parseFloat(req.body.weight) < 0)) {
      errors.push({ field: 'weight', message: 'Weight must be a positive number' });
    }
    
    if (req.body.length && (isNaN(parseFloat(req.body.length)) || parseFloat(req.body.length) < 0)) {
      errors.push({ field: 'length', message: 'Length must be a positive number' });
    }
    
    if (req.body.latitude && (isNaN(parseFloat(req.body.latitude)) || parseFloat(req.body.latitude) < -90 || parseFloat(req.body.latitude) > 90)) {
      errors.push({ field: 'latitude', message: 'Invalid latitude. Must be between -90 and 90' });
    }
    
    if (req.body.longitude && (isNaN(parseFloat(req.body.longitude)) || parseFloat(req.body.longitude) < -180 || parseFloat(req.body.longitude) > 180)) {
      errors.push({ field: 'longitude', message: 'Invalid longitude. Must be between -180 and 180' });
    }
    
    if (req.body.notes && req.body.notes.length > 1000) {
      errors.push({ field: 'notes', message: 'Notes must be less than 1000 characters' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    const {
      species,
      weight,
      length,
      location,
      latitude,
      longitude,
      date,
      notes
    } = req.body;

    // Handle uploaded photo
    let photoUrls = [];
    if (req.file) {
      // File is now saved to disk, create the URL using the actual filename
      photoUrls = [`/uploads/catches/${req.file.filename}`];
    }

    // Insert catch into database
    const result = await pool.query(
      `INSERT INTO catches (user_id, species, weight, length, location, latitude, longitude, date, notes, photo_urls, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
      [
        req.userId, 
        species, 
        weight ? parseFloat(weight) : null, 
        length ? parseFloat(length) : null, 
        location, 
        latitude ? parseFloat(latitude) : null, 
        longitude ? parseFloat(longitude) : null, 
        date, 
        notes || null, 
        JSON.stringify(photoUrls)
      ]
    );
    const newCatch = result.rows[0];

    res.status(201).json({
      message: 'Catch created successfully',
      catch: newCatch
    });

  } catch (error) {
    console.error('Create catch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/catches/:id - Update a catch
router.put('/:id', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid catch ID' });
    }

    // Manual validation for multipart form data (similar to POST endpoint)
    const errors = [];
    
    if (req.body.species && req.body.species.trim().length === 0) {
      errors.push({ field: 'species', message: 'Species cannot be empty' });
    }
    
    if (req.body.location && req.body.location.trim().length === 0) {
      errors.push({ field: 'location', message: 'Location cannot be empty' });
    }
    
    if (req.body.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!dateRegex.test(req.body.date)) {
        errors.push({ field: 'date', message: 'Invalid date format. Expected ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)' });
      }
    }
    
    if (req.body.weight && (isNaN(parseFloat(req.body.weight)) || parseFloat(req.body.weight) < 0)) {
      errors.push({ field: 'weight', message: 'Weight must be a positive number' });
    }
    
    if (req.body.length && (isNaN(parseFloat(req.body.length)) || parseFloat(req.body.length) < 0)) {
      errors.push({ field: 'length', message: 'Length must be a positive number' });
    }
    
    if (req.body.latitude && (isNaN(parseFloat(req.body.latitude)) || parseFloat(req.body.latitude) < -90 || parseFloat(req.body.latitude) > 90)) {
      errors.push({ field: 'latitude', message: 'Invalid latitude. Must be between -90 and 90' });
    }
    
    if (req.body.longitude && (isNaN(parseFloat(req.body.longitude)) || parseFloat(req.body.longitude) < -180 || parseFloat(req.body.longitude) > 180)) {
      errors.push({ field: 'longitude', message: 'Invalid longitude. Must be between -180 and 180' });
    }
    
    if (req.body.notes && req.body.notes.length > 1000) {
      errors.push({ field: 'notes', message: 'Notes must be less than 1000 characters' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Check if catch exists and belongs to user
    const existingResult = await pool.query('SELECT id FROM catches WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catch not found' });
    }

    const updateFields = {};
    // Only include fields that actually exist in the database table
    const allowedFields = ['species', 'weight', 'length', 'location', 'latitude', 'longitude', 'date', 'notes', 'photo_urls'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Handle uploaded photo
    if (req.file) {
      // File is now saved to disk, create the URL using the actual filename
      const photoUrls = [`/uploads/catches/${req.file.filename}`];
      updateFields.photo_urls = JSON.stringify(photoUrls);
    }

    // Note: Additional fields like lure_type, depth, weather data etc. 
    // would need database migration to add these columns first

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Update catch in database
    const setClause = Object.keys(updateFields).map((field, index) => `${field} = $${index + 3}`).join(', ');
    const values = Object.values(updateFields);
    const result = await pool.query(
      `UPDATE catches SET ${setClause}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.userId, ...values]
    );
    const updatedCatch = result.rows[0];

    // Format the response to include coordinates object like in the GET endpoint
    const formattedCatch = {
      ...updatedCatch,
      coordinates: {
        lat: parseFloat(updatedCatch.latitude),
        lng: parseFloat(updatedCatch.longitude)
      }
    };

    res.json({
      message: 'Catch updated successfully',
      catch: formattedCatch
    });

  } catch (error) {
    console.error('Update catch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/catches/:id - Delete a catch
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid catch ID' });
    }

    // Delete catch from database
    const result = await pool.query('DELETE FROM catches WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catch not found' });
    }

    res.json({ message: 'Catch deleted successfully' });

  } catch (error) {
    console.error('Delete catch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/catches/stats - Get user's catch statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    // TODO: Get statistics from database
    // const totalCatchesResult = await db.query('SELECT COUNT(*) FROM catches WHERE user_id = $1', [req.userId]);
    // const speciesCountResult = await db.query('SELECT COUNT(DISTINCT species) FROM catches WHERE user_id = $1', [req.userId]);
    // const avgWeightResult = await db.query('SELECT AVG(weight) FROM catches WHERE user_id = $1 AND weight IS NOT NULL', [req.userId]);
    // const biggestCatchResult = await db.query('SELECT * FROM catches WHERE user_id = $1 AND weight IS NOT NULL ORDER BY weight DESC LIMIT 1', [req.userId]);

    // Mock stats for now
    const stats = {
      totalCatches: 25,
      uniqueSpecies: 8,
      averageWeight: 2.3,
      totalWeight: 57.5,
      biggestCatch: {
        species: 'Bass',
        weight: 5.2,
        location: 'Lake Superior',
        date: '2024-01-01T12:00:00Z'
      },
      catchesByMonth: {
        '2024-01': 5,
        '2024-02': 8,
        '2024-03': 12
      },
      topSpecies: [
        { species: 'Bass', count: 10 },
        { species: 'Trout', count: 8 },
        { species: 'Pike', count: 4 },
        { species: 'Walleye', count: 3 }
      ]
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get catch stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;