import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import NameRequest, { INameRequest, RequestStatus } from '../models/NameRequest';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

// Define the upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper function to handle file uploads
const handleFileUpload = async (file: Express.Multer.File): Promise<string | null> => {
  if (!file) return null;
  
  try {
    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Ensure the upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    
    // Save file to uploads directory
    await fs.promises.writeFile(filepath, file.buffer);
    
    // Return relative path for storage in DB
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error handling file upload:', error);
    return null;
  }
};

// Helper function to clean up uploaded files
const cleanupFiles = async (files: Express.Multer.File[] = []) => {
  const cleanupPromises = files.map(async (file) => {
    if (file.path && fs.existsSync(file.path)) {
      try {
        await unlinkAsync(file.path);
      } catch (error) {
        console.error(`Error deleting file ${file.path}:`, error);
      }
    }
  });
  await Promise.all(cleanupPromises);
};

// @desc    Create a new name request
// @route   POST /api/name-requests
// @access  Private
const createNameRequest = async (req: Request, res: Response, next: NextFunction) => {
  const files = Array.isArray(req.files) ? req.files : [];
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    // Handle file uploads if any
    const attachments: string[] = [];
    for (const file of files) {
      try {
        const filePath = await handleFileUpload(file);
        if (filePath) {
          attachments.push(filePath);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        // Continue with other files even if one fails
      }
    }

    // Create name request
    const nameRequest = new NameRequest({
      ...req.body,
      submittedBy: userId,
      status: 'submitted' as RequestStatus,
      submittedAt: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined,
      // Set default values for optional fields
      isCoined: Boolean(req.body.isCoined) || false,
      isAcronymHeavy: Boolean(req.body.isAcronymHeavy) || false,
      isConcatenated: Boolean(req.body.isConcatenated) || false,
      trademarked: Boolean(req.body.trademarked) || false,
    });

    // Validate the request
    const validationError = nameRequest.validateSync();
    if (validationError) {
      // Clean up uploaded files if validation fails
      await cleanupFiles(files);
      throw new ApiError(validationError.message, 400);
    }

    await nameRequest.save();
    
    // Clean up temporary files after successful save
    await cleanupFiles(files);
    
    // Populate user details for response
    await nameRequest.populate('submittedBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: nameRequest,
      message: 'Name request submitted successfully'
    });
  } catch (error) {
    // Clean up any uploaded files if there was an error
    await cleanupFiles(files);
    next(error);
  }
};

// @desc    Get all name requests
// @route   GET /api/name-requests
// @access  Private
const getNameRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, assetType, search, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'reviewer';
    
    const query: any = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by asset type if provided
    if (assetType) {
      query.assetType = assetType;
    }
    
    // Apply search filter if search term is provided
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // If user is not an admin or reviewer, only show their own requests
    if (!isAdmin && userId) {
      query.submittedBy = userId;
    }
    
    // Build sort object
    const sort: any = {};
    const sortField = typeof sortBy === 'string' ? sortBy : 'submittedAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    sort[sortField] = sortDirection;
    
    // Execute query with pagination
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10;
    const skip = (page - 1) * limit;
    
    const [requests, total] = await Promise.all([
      NameRequest.find(query)
        .populate('submittedBy', 'name email')
        .populate('reviewerId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      NameRequest.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single name request
// @route   GET /api/name-requests/:id
// @access  Private
const getNameRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nameRequest = await NameRequest.findById(req.params.id);
    
    if (!nameRequest) {
      return next(new ApiError(404, 'Name request not found'));
    }
    
    res.status(200).json({
      success: true,
      data: nameRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update name request
// @route   PUT /api/name-requests/:id
// @access  Private
const updateNameRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nameRequest = await NameRequest.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!nameRequest) {
      return next(new ApiError(404, 'Name request not found'));
    }
    
    res.status(200).json({
      success: true,
      data: nameRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete name request
// @route   DELETE /api/name-requests/:id
// @access  Private/Admin
const deleteNameRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nameRequest = await NameRequest.findByIdAndDelete(req.params.id);
    
    if (!nameRequest) {
      return next(new ApiError(404, 'Name request not found'));
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export {
  createNameRequest,
  getNameRequests,
  getNameRequest,
  updateNameRequest,
  deleteNameRequest
};
