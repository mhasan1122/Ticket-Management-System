import { z } from 'zod';

const userSignupSchema = z.object({
    name: z.string()
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name must be at most 50 characters long'),

  email: z.string()
    .email('Invalid email')
    .min(1, 'Email is required'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),

  phone: z.string()
    .min(10, 'Phone number must be at least 10 characters long')
    .max(15, 'Phone number must be at most 15 characters long'),

 

  address: z.string()
    

 
});

const userLoginSchema = z.object({
  email: z.string()
    .email('Invalid email')
    .min(1, 'Email is required'),

  password: z.string()
    .min(1, 'Password is required'),
});

export { userSignupSchema, userLoginSchema };
