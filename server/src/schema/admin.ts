import { z } from 'zod';

const signupSchema = z.object({
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

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required'),
});

const busSchema = z.object({
  name: z.string().min(1, 'Bus name is required'),
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  departure_time: z.string().min(1, 'Departure time is required'),
  arrival_time: z.string().min(1, 'Arrival time is required'),
});

const ticketCreateSchema = z.object({
  busId: z.string().min(1, { message: "Bus ID is required" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  time_slot: z.string().min(1, { message: "Time slot is required" }),
  seats_available: z.number().int().positive({ message: "Seats available must be a positive integer" }),
  date: z.string().min(1, { message: "Date is required" }),
});

const ticketUpdateSchema = z.object({
  price: z.number().positive({ message: "Price must be a positive number" }).optional(),
  time_slot: z.string().min(1, { message: "Time slot is required" }).optional(),
  seats_available: z.number().int().positive({ message: "Seats available must be a positive integer" }).optional(),
  date: z.string().min(1, { message: "Date is required" }).optional(),
});

export {signupSchema,loginSchema,busSchema,ticketCreateSchema,ticketUpdateSchema};