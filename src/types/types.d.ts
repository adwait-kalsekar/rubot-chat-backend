import { User } from "../models/user.model"; // Adjust the import to match your User model's type

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
