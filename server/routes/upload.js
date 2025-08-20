const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
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

// Configure AWS S3 (if credentials are available)
let s3;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  s3 = new AWS.S3();
}

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
  }
};

// Generate unique filename
const generateFileName = (file) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(file.originalname);
  return `${timestamp}-${random}${extension}`;
};

// Configure multer for S3 upload (if S3 is available)
let upload;
if (s3) {
  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET || 'markyourfish-uploads',
      acl: 'public-read',
      key: function (req, file, cb) {
        const fileName = generateFileName(file);
        const folder = req.uploadType === 'profile' ? 'profiles' : 'catches';
        cb(null, `${folder}/${req.userId}/${fileName}`);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE
    }),
    fileFilter: imageFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5 // Max 5 files per upload
    }
  });
} else {
  // Local storage fallback for development
  const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../uploads');
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, generateFileName(file));
    }
  });

  upload = multer({
    storage: localStorage,
    fileFilter: imageFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5 // Max 5 files per upload
    }
  });
}

// Error handler for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 files per upload.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name for file upload.' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
};

// Middleware to set upload type
const setUploadType = (type) => (req, res, next) => {
  req.uploadType = type;
  next();
};

// POST /api/upload/catch-photos - Upload photos for a catch
router.post('/catch-photos', 
  authenticateToken,
  setUploadType('catch'),
  (req, res, next) => {
    upload.array('photos', 5)(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedFiles = req.files.map(file => {
        let fileUrl;
        if (s3) {
          fileUrl = file.location; // S3 URL
        } else {
          // Local file URL (in production you'd use a proper file server)
          fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        }

        return {
          originalName: file.originalname,
          filename: file.key || file.filename,
          url: fileUrl,
          size: file.size,
          mimetype: file.mimetype
        };
      });

      // TODO: Save file references to database
      // await db.query('INSERT INTO uploaded_files (user_id, file_type, files, created_at) VALUES ($1, $2, $3, NOW())', 
      //   [req.userId, 'catch_photos', JSON.stringify(uploadedFiles)]);

      res.status(201).json({
        message: 'Photos uploaded successfully',
        files: uploadedFiles
      });

    } catch (error) {
      console.error('Upload catch photos error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/upload/profile-picture - Upload profile picture
router.post('/profile-picture',
  authenticateToken,
  setUploadType('profile'),
  (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      let fileUrl;
      if (s3) {
        fileUrl = req.file.location; // S3 URL
      } else {
        // Local file URL
        fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }

      const uploadedFile = {
        originalName: req.file.originalname,
        filename: req.file.key || req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      };

      // TODO: Update user profile picture in database
      // await db.query('UPDATE users SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2', 
      //   [fileUrl, req.userId]);

      res.status(201).json({
        message: 'Profile picture uploaded successfully',
        file: uploadedFile
      });

    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/upload/presigned-url - Get presigned URL for direct S3 upload
router.post('/presigned-url',
  authenticateToken,
  [
    body('fileName').trim().isLength({ min: 1 }).withMessage('File name is required'),
    body('fileType').isIn(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']).withMessage('Invalid file type'),
    body('uploadType').isIn(['catch', 'profile']).withMessage('Invalid upload type')
  ],
  async (req, res) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      if (!s3) {
        return res.status(503).json({ error: 'S3 service not configured' });
      }

      const { fileName, fileType, uploadType } = req.body;

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(fileName);
      const uniqueFileName = `${timestamp}-${random}${extension}`;

      const folder = uploadType === 'profile' ? 'profiles' : 'catches';
      const key = `${folder}/${req.userId}/${uniqueFileName}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET || 'markyourfish-uploads',
        Key: key,
        Expires: 300, // 5 minutes
        ContentType: fileType,
        ACL: 'public-read'
      };

      const presignedUrl = s3.getSignedUrl('putObject', params);
      const publicUrl = `https://${params.Bucket}.s3.amazonaws.com/${key}`;

      res.json({
        presignedUrl,
        publicUrl,
        key,
        expires: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
      });

    } catch (error) {
      console.error('Generate presigned URL error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/upload/files - Get user's uploaded files
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const { type, limit = 20, offset = 0 } = req.query;

    // TODO: Get files from database
    // let query = 'SELECT * FROM uploaded_files WHERE user_id = $1';
    // let params = [req.userId];
    
    // if (type) {
    //   query += ' AND file_type = $2';
    //   params.push(type);
    // }
    
    // query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    // params.push(limit, offset);
    
    // const result = await db.query(query, params);

    // Mock files for now
    const files = [
      {
        id: 1,
        user_id: req.userId,
        file_type: 'catch_photos',
        files: [
          {
            originalName: 'bass-catch.jpg',
            filename: '1234567890-abc123.jpg',
            url: 'https://example.com/catches/1234567890-abc123.jpg',
            size: 2048576,
            mimetype: 'image/jpeg'
          }
        ],
        created_at: '2024-01-15T10:30:00Z'
      }
    ];

    res.json({
      files,
      total: files.length
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/upload/files/:id - Delete uploaded file
router.delete('/files/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // TODO: Get file info from database
    // const result = await db.query('SELECT * FROM uploaded_files WHERE id = $1 AND user_id = $2', [id, req.userId]);
    // if (result.rows.length === 0) {
    //   return res.status(404).json({ error: 'File not found' });
    // }
    // const fileRecord = result.rows[0];

    // Delete from S3 if configured
    if (s3) {
      try {
        // TODO: Extract S3 key from file URL or store it separately
        // const s3Key = extractS3KeyFromUrl(fileRecord.url);
        // await s3.deleteObject({
        //   Bucket: process.env.AWS_S3_BUCKET || 'markyourfish-uploads',
        //   Key: s3Key
        // }).promise();
      } catch (s3Error) {
        console.error('S3 delete error:', s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // TODO: Delete from database
    // await db.query('DELETE FROM uploaded_files WHERE id = $1 AND user_id = $2', [id, req.userId]);

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/upload/stats - Get upload statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // TODO: Get upload stats from database
    // const result = await db.query(`
    //   SELECT 
    //     file_type,
    //     COUNT(*) as count,
    //     SUM(jsonb_array_length(files)) as total_files,
    //     SUM((files->0->>'size')::bigint) as total_size
    //   FROM uploaded_files 
    //   WHERE user_id = $1 
    //   GROUP BY file_type
    // `, [req.userId]);

    // Mock stats for now
    const stats = {
      totalFiles: 15,
      totalSize: 25600000, // bytes
      byType: {
        catch_photos: {
          count: 12,
          size: 20480000
        },
        profile: {
          count: 3,
          size: 5120000
        }
      },
      storageUsed: 0.025, // GB
      storageLimit: 5.0 // GB for free users
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get upload stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/upload/cleanup - Clean up orphaned files
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // TODO: Find and clean up orphaned files
    // This would be a background job in production
    
    // Find files that are not referenced in catches or user profiles
    // const orphanedFiles = await db.query(`
    //   SELECT uf.* FROM uploaded_files uf
    //   LEFT JOIN catches c ON c.photo_urls ? uf.files->0->>'url'
    //   LEFT JOIN users u ON u.profile_picture_url = uf.files->0->>'url'
    //   WHERE uf.user_id = $1 AND c.id IS NULL AND u.id IS NULL
    //   AND uf.created_at < NOW() - INTERVAL '24 hours'
    // `, [req.userId]);

    // Clean up from S3 and database
    // ... cleanup logic

    res.json({
      message: 'Cleanup completed',
      filesRemoved: 0,
      spaceFreed: 0
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;