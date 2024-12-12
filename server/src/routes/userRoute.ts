import  express  from "express";
import { errorHandler } from "../error-handler";
import { getAllBuses, getAvailableTickets, purchaseTicket } from "../controllers/userController";
import userAuthMiddleware from "../middleware/userAuth";
const router = express.Router();


router.get('/buses', userAuthMiddleware,errorHandler(getAllBuses));

// View available tickets for a specific bus and time period
router.get('/tickets', userAuthMiddleware,errorHandler(getAvailableTickets));

// Purchase a ticket for a specific bus and time
router.post('/tickets/purchase', userAuthMiddleware,errorHandler(purchaseTicket));
export default router;