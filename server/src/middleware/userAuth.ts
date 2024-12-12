import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/user"; 
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import tokenBlacklist from "./blacklistToken";

interface UserType {
  id?: string;
  name: string;
  email: string;
  // Add other fields based on your User schema
}

const JWT_SECRET = process.env.JWT_SECRET_KEY || "12sawegg23grr434";
if (!process.env.JWT_SECRET_KEY) {
  console.warn("JWT_SECRET_KEY is not defined in the environment variables. Using fallback.");
}

const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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

    // Find the user using the decoded email
    // For MongoDB with Mongoose
    const user = await UserModel.findOne({ email: payload.email });

    if (!user) {
      return next(new UnauthorizedException("User not found or invalid token", null, ErrorCode.UNAUTHORIZED));
    }

    // Attach the user object to req.user
    (req as Request & { user: UserType }).user = user;

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

export default userAuthMiddleware;
