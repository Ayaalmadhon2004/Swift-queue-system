import express from 'express';
import {createOrder, getOrder, getOrders} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my-orders', getMyOrders); 
router.post('/', createOrder);        
router.get('/', getOrders);          
router.get('/:id', getOrder);         

export default router;