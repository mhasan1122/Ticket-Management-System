import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import hpp from 'hpp';
import router from './routes/index';
import { errorMiddleware } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ticket';

// Middleware Configuration

  app.use(morgan('combined'));
  app.use(helmet());
  app.use(hpp());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const allowedOrigins = ['http://localhost:3000'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    })
  );

app.use(router)

app.use(errorMiddleware)

// MongoDB connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if the connection fails
  }
};


// Application Initialization
const startServer = async () => {

 
  await connectToDatabase(); // Connect to the database

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
