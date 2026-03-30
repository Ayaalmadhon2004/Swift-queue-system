import express from 'express';
import {createOrder, getOrder, getOrders} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/',createOrder);
router.get('/:id', getOrder); 
router.get('/', getOrders);


export default router;