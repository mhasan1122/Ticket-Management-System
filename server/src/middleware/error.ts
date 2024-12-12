import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { HttpException } from '../exceptions/root'; // Custom exception class

// Explicitly type the middleware as an error handler
export const errorMiddleware: ErrorRequestHandler = (
  error: any,  // Catch any error type, not just HttpException
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 if no status code is set
  const statusCode = error.statusCode || 500;

  // Prepare the error response object
  const response: any = {
    message: error.message || 'Internal Server Error',  // Fallback to a generic message
    errorCode: error.errorCode || 'UNKNOWN_ERROR',    // Fallback errorCode
    errors: error.errors || null,  // Specific errors (if available, e.g., validation errors)
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,  // Only show stack trace in dev mode
  };

  // Handle known error types
  if (error instanceof HttpException) {
    // For custom HttpException, it's already handled above
  } else if (error.name === 'ValidationError') {
    // Handle Mongoose ValidationError (e.g., missing or invalid fields)
    response.message = 'Validation Error';
    response.errors = error.errors;
    response.errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'MongoNetworkError') {
    // Handle network-related errors (MongoDB connection issues)
    response.message = 'Database connection error';
    response.errorCode = 'DB_CONNECTION_ERROR';
  } else if (error.name === 'MongoError') {
    // Handle generic MongoDB errors (e.g., unique constraint violation)
    response.message = 'Database error';
    response.errorCode = 'DB_ERROR';
  } else if (error instanceof SyntaxError) {
    // Handle SyntaxError (e.g., malformed JSON)
    response.message = 'Syntax error in the request';
    response.errorCode = 'SYNTAX_ERROR';
  } else if (error instanceof TypeError) {
    // Handle TypeError (e.g., undefined variable)
    response.message = 'Unexpected type error';
    response.errorCode = 'TYPE_ERROR';
  } else {
    // For any other unknown errors, just use generic message
    console.error('Unhandled error: ', error);
  }

  // Log error details for debugging in the server logs
  console.error(`Error (${statusCode}):`, response.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);  // Log stack trace in development mode
  }

  // Send the response to the client
  res.status(statusCode).json(response);
};
