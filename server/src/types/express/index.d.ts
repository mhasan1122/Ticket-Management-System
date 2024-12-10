import { Admin} from './models/Admin'; // Import your Admin model

declare global {
  namespace Express {
    interface Request {
      admin: Admin; // Add admin property to the Request interface
    }
  }
}
