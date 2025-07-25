import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createNameRequest,
  getNameRequests,
  getNameRequest,
  updateNameRequest,
  deleteNameRequest
} from '../controllers/nameRequestController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create a temporary uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'temp-uploads');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only certain file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and Word documents are allowed.'));
  }
};

// Initialize multer with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum of 5 files per request
  }
});

// Apply authentication middleware to all routes
router.use(protect);

// Name request routes
router
  .route('/')
  .get(authorize('submitter', 'reviewer', 'admin'), getNameRequests)
  .post(
    authorize('submitter', 'admin'),
    upload.array('attachments', 5), // Handle up to 5 files in a field named 'attachments'
    (req, res, next) => {
      // Handle multer errors
      if (req.fileValidationError) {
        return res.status(400).json({
          success: false,
          message: req.fileValidationError
        });
      }
      next();
    },
    createNameRequest
  );

// Single name request routes
router
  .route('/:id')
  .get(authorize('submitter', 'reviewer', 'admin'), getNameRequest)
  .put(
    authorize('submitter', 'reviewer', 'admin'),
    upload.array('attachments', 5),
    updateNameRequest
  )
  .delete(authorize('admin'), deleteNameRequest);

export default router;
