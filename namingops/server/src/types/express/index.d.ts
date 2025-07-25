import { IUser } from '../../middleware/auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & {
        id: string;
        role: string;
      };
      files?: Express.Multer.File[];
      fileValidationError?: string;
    }

    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer?: Buffer;
      }
    }
  }
}
