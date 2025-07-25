import { IUser } from '../../middleware/auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
