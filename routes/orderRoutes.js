import express from 'express';
import {createOrder, getOrder, getOrders} from '../controllers/orderController.js';

const router = express.Router();

router.post('/',createOrder);
router.get('/:id', getOrder); 
router.get('/', getOrders);


export default router;