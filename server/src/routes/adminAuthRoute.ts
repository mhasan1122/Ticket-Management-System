import  express  from "express";
import { errorHandler } from "../error-handler";
import adminAuthMiddleware from "../middleware/adminAuth";
import { createAdmin, login, logout, me } from "../controllers/adminAuthController";
const router = express.Router();
router.post('/resister', errorHandler(createAdmin));
router.post('/login', errorHandler(login));
router.get('/profile', adminAuthMiddleware,errorHandler(me));
router.get('/logout', adminAuthMiddleware,errorHandler(logout));


export default router;