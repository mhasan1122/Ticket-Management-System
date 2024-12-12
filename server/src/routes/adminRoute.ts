import  express  from "express";
import { errorHandler } from "../error-handler";
import { addBus, deleteBus, deleteTicket, updateBus, updateTicket, uploadTicket, viewAllBuses, viewBusById } from "../controllers/adminController";
import adminAuthMiddleware from "../middleware/adminAuth";
const router = express.Router();
router.post('/buses',adminAuthMiddleware, errorHandler(addBus));
router.delete('/buses/:id',adminAuthMiddleware, errorHandler(deleteBus));
router.put('/buses/:id',adminAuthMiddleware, errorHandler(updateBus));
router.get('/buses', adminAuthMiddleware,errorHandler(viewAllBuses));
router.get('/buses/:id',adminAuthMiddleware,errorHandler(viewBusById));
router.post('/tickets',adminAuthMiddleware, errorHandler(uploadTicket));
router.put('/tickets/:ticketId', adminAuthMiddleware, errorHandler(updateTicket));
router.delete('/tickets/:ticketId',adminAuthMiddleware, errorHandler(deleteTicket));

export default router;