import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import { UnprocessableEntity } from "../exceptions/validation";
import { userSignupSchema, userLoginSchema } from "../schema/user";
import bcrypt from "bcryptjs";
import UserModel from "../models/user"; // Assuming you have a Mongoose model for User
import tokenBlacklist from "../middleware/blacklistToken";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "12sawegg23grr434"; // Fallback to a hardcoded secret if not in env

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<any | Response> => {
  console.log(req.body);
  // Zod validation
  const result = userSignupSchema.safeParse(req.body);
  if (!result.success) {
    return next(new UnprocessableEntity(result.error.errors, "Validation Error"));
  }

  const { name, email, password, phone, address } = req.body;

  // Check for missing fields
  if (!name || !email || !password || !phone || !address) {
    return next(new BadRequestException("All fields are required", ErrorCode.MISSING_FIELDS));
  }

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return next(new BadRequestException("User already exists", ErrorCode.USER_ALREADY_EXISTS));
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user in the database
  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
  });
  await newUser.save();

  // Exclude the password from the response
  const { password: _, ...userResponse } = newUser.toObject();
  return res.status(201).json({ message: "User created successfully", user: userResponse });
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any | Response> => {
  console.log(req.body);
  // Zod validation for request body
  const validation = userLoginSchema.safeParse(req.body);

  // If validation fails, throw a custom error
  if (!validation.success) {
    return next(new UnprocessableEntity(validation.error.errors, "Validation Error"));
  }

  const { email, password } = req.body;

  // Check if the required fields are present
  if (!email || !password) {
    return next(new BadRequestException("All fields are required", ErrorCode.MISSING_FIELDS));
  }

  // Find the user by email using MongoDB (Mongoose)
  const user = await UserModel.findOne({ email });

  // If the user doesn't exist, throw an error
  if (!user) {
    return next(new BadRequestException("User not found", ErrorCode.USER_NOT_FOUND));
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // If the password is incorrect, throw an error
  if (!isPasswordValid) {
    return next(new BadRequestException("Incorrect password", ErrorCode.INCORRECT_PASSWORD));
  }

  // Generate JWT token with the user's id, email
  const token = jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET as string,
    { expiresIn: "1h" } // Set token expiration time (e.g., 1 hour)
  );

  // Send the token in the response
  return res.status(200).json({ message: "Login successful", token });
};

export const me = async (req: Request, res: Response) => {
  try {
    console.log(req.headers);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1]; // Assuming token is in the format "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    } catch (err) {
      console.error("Token verification failed", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (!payload || !payload.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Find the user using the decoded email
    const user = await UserModel.findOne({ email: payload.email }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(user);
    res.json({ message: "Success", user }); // Return only desired fields
  } catch (error) {
    console.error("An error occurred", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1]; // Assuming token is in the format "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    // Blacklist the token
    tokenBlacklist.add(token);

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("An error occurred during logout", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
