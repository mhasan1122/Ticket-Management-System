import express from "express";
import { errorHandler } from "../error-handler";
import userAuthMiddleware from "../middleware/userAuth";
import { createUser, login, logout, me } from "../controllers/userAuthController";

const router = express.Router();

// Define user authentication routes
// router.post('/register', createUser);
router.post('/register', errorHandler(createUser));
router.post('/login', errorHandler(login));
router.get('/profile', userAuthMiddleware, errorHandler(me));
router.get('/logout', userAuthMiddleware, errorHandler(logout));

export default router;
