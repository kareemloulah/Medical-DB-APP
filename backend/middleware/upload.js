import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(null, 'patient-' + uniqueSuffix + fileExtension);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file per upload
  }
});

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 5MB.' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          message: 'Too many files. Only one file allowed.' 
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          message: 'Unexpected field name for file upload.' 
        });
      default:
        return res.status(400).json({ 
          message: 'File upload error: ' + error.message 
        });
    }
  }

  if (error.message.includes('Only image files')) {
    return res.status(400).json({ 
      message: error.message 
    });
  }

  next(error);
};

export default upload;