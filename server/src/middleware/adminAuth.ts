import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AdminModel from "../models/admin"; // Adjust path as needed
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import tokenBlacklist from "./blacklistToken";

interface AdminType {
  id?: string;
  name: string;
  email: string;
  // Add other fields based on your Admin schema
}

const JWT_SECRET = process.env.JWT_SECRET_KEY || "12sawegg23grr434";
if (!process.env.JWT_SECRET_KEY) {
  console.warn("JWT_SECRET_KEY is not defined in the environment variables. Using fallback.");
}

const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Assuming token is in format "Bearer <token>"

  if (!token) {
    return next(new UnauthorizedException("Token not provided", null, ErrorCode.UNAUTHORIZED));
  }

  if (tokenBlacklist.has(token)) {
    return next(new UnauthorizedException("Token has been blacklisted", null, ErrorCode.UNAUTHORIZED));
  }

  try {
    // Verify the token and decode the payload
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (!payload || !payload.email) {
      
      return next(new UnauthorizedException("Invalid token payload", null, ErrorCode.UNAUTHORIZED));
    }


    // Find the admin using the decoded email
    // For MongoDB with Mongoose
   const admin = await AdminModel.findOne({ email: payload.email });


    if (!admin) {
      return next(new UnauthorizedException("Admin not found or invalid token", null, ErrorCode.UNAUTHORIZED));
    }

    // Attach the admin object to req.admin
    (req as Request & { admin: AdminType }).admin = admin;

    // Call the next middleware
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedException("Invalid token", null, ErrorCode.UNAUTHORIZED));
    }

    // Handle other unexpected errors
    next(error);
  }
};

export default adminAuthMiddleware;
