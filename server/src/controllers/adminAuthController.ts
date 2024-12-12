import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import { UnprocessableEntity } from "../exceptions/validation";
import { loginSchema, signupSchema } from "../schema/admin";
import bcrypt from "bcryptjs";
import AdminModel from "../models/admin"; // Assuming you have a Mongoose model for Admin
import  tokenBlacklist from "../middleware/blacklistToken";


import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET_KEY || "12sawegg23grr434"; // Fallback to a hardcoded secret if not in env


export const createAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any | Response> => {
  
    // Zod validation
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return next(new UnprocessableEntity(result.error.errors, "Validation Error"));
    }

    const { name, email, password, phone, address} = req.body;

    // Check for missing fields
    if (!name || !email || !password || !phone || !address) {
      return next(new BadRequestException("All fields are required", ErrorCode.MISSING_FIELDS));
    }

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return next(new BadRequestException("Admin already exists", ErrorCode.ADMIN_ALREADY_EXISTS));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin in the database
    const newAdmin = new AdminModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      
    });
    await newAdmin.save();

    // Exclude the password from the response
    const { password: _, ...adminResponse } = newAdmin.toObject();
    return res.status(201).json({ message: "Admin created successfully", admin: adminResponse });
  
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any | Response> => {

  console.log(req.body)
  // Zod validation for request body
  const validation = loginSchema.safeParse(req.body);

  // If validation fails, throw a custom error
  if (!validation.success) {
    return next(new UnprocessableEntity(validation.error.errors, 'Validation Error'));
  }

  const { email, password } = req.body;

  // Check if the required fields are present
  if (!email || !password) {
    return next(new BadRequestException('All fields are required', ErrorCode.MISSING_FIELDS));
  }

  // Find the admin by email using MongoDB (Mongoose)
  const admin = await AdminModel.findOne({ email });

  // If the admin doesn't exist, throw an error
  if (!admin) {
    return next(new BadRequestException('Admin not found', ErrorCode.ADMIN_NOT_FOUND));
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, admin.password);

  // If the password is incorrect, throw an error
  if (!isPasswordValid) {
    return next(new BadRequestException('Incorrect password', ErrorCode.INCORRECT_PASSWORD));
  }

  // Generate JWT token with the admin's id, email, and role
  const token = jwt.sign(
    { id: admin._id, email: admin.email},
    JWT_SECRET as string, 
    { expiresIn: '1h' } // Set token expiration time (e.g., 1 hour)
  );
    
  // Send the token in the response
  return res.status(200).json({ message: 'Login successful', token });
};


export const me = async (req: Request, res: Response) => {
 

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1]; // Assuming token is in the format "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    let payload;
    
      payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    

    if (!payload || !payload.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Find the admin using the decoded email
    const admin = await AdminModel.findOne({ email: payload.email }).lean();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log(admin);
    res.json({ message: "Success", admin }); // Return only desired fields
  
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
 
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
  
};
