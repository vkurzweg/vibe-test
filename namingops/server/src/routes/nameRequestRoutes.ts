import { Router } from 'express';
import {
  createNameRequest,
  getNameRequests,
  getNameRequest,
  updateNameRequest,
  deleteNameRequest
} from '../controllers/nameRequestController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

router
  .route('/')
  .get(authorize('submitter', 'reviewer', 'admin'), getNameRequests)
  .post(authorize('submitter', 'admin'), createNameRequest);

router
  .route('/:id')
  .get(authorize('submitter', 'reviewer', 'admin'), getNameRequest)
  .put(authorize('submitter', 'reviewer', 'admin'), updateNameRequest)
  .delete(authorize('admin'), deleteNameRequest);

export default router;
