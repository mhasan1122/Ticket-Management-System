import  express  from "express";
import { errorHandler } from "../error-handler";
import adminAuthMiddleware from "../middleware/adminAuth";
import { createAdmin, login, me } from "../controllers/adminAuthController";
const router = express.Router();
router.post('/resister', errorHandler(createAdmin));
router.post('/login', errorHandler(login));
router.get('/profile', errorHandler(me));

export default router;