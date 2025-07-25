import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import NameRequest, { INameRequest } from '../models/NameRequest';

// @desc    Create a new name request
// @route   POST /api/name-requests
// @access  Private
const createNameRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nameRequest = new NameRequest({
      ...req.body,
      status: 'New',
      created_at: new Date(),
      updated_at: new Date()
    });

    await nameRequest.save();
    res.status(201).json({
      success: true,
      data: nameRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all name requests
// @route   GET /api/name-requests
// @access  Private
const getNameRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, requestor_id } = req.query;
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    // If user is not an admin or reviewer, only show their own requests
    if (requestor_id) {
      query.requestor_id = requestor_id;
    }

    const nameRequests = await NameRequest.find(query).sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      count: nameRequests.length,
      data: nameRequests
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
