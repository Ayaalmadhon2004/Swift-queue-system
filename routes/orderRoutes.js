import express from 'express';
import {createOrder, getOrder, getOrders,getMyOrders,getWaitingCount} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.use(protect);

router.get('/my-orders', getMyOrders); 
router.post('/', createOrder);        
router.get('/', getOrders);          
router.get('/:id', getOrder);         
// what is the difference between upove and bottom code ? line and multi lines 
router.get('/public', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
        where: {
            status: { in: ['PREPARING', 'READY'] } //status in what is it ?
        },
        select: { queueNumber: true, status: true, id: true } 
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch display data" });
    }
});
export default router;