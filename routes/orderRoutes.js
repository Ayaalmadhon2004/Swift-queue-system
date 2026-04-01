import express from 'express';
import {createOrder, getOrder, getOrders} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
// why i am using "/" and "/my-orders" and where i will use them and when and how ?
router.post('/',createOrder);
router.get('/:id', getOrder); 
router.get('/', getOrders);
router.get('/my-orders',protect,getMyOrders);


export default router;