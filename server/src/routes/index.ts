import  express  from "express";
import adminAuthRoute from "./adminAuthRoute";
import adminRoute from "./adminRoute";
import userAuthRoute from "./userAuthRoute";
import userRoute from "./userRoute";
const router = express.Router();
router.use('/admin/auth', adminAuthRoute);
router.use('/admin', adminRoute);
router.use('/auth', userAuthRoute);
router.use('/auth', userAuthRoute);

router.use('', userRoute);
export default router;
