export enum ErrorCode {
    ADMIN_NOT_FOUND = 1001,
    ADMIN_ALREADY_EXISTS = 1002,
    INCORRECT_PASSWORD = 1003,
    UNAUTHORIZED = 1004, // Explicitly set the error code
    Unprocessable_Entity = 2001,
    MISSING_FIELDS = 1005,
    Internal_Exception=3001,


    

}

export class HttpException extends Error {
    message: string;
    errorCode: ErrorCode;
    statusCode: number;
    error: unknown;

    constructor(message: string, errorCode: ErrorCode, statusCode: number, error: unknown) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.error = error;

        // Ensure the stack trace is preserved correctly
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpException);
        }
        // Set prototype explicitly for proper inheritance
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}