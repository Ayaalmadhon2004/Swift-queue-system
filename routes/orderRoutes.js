import express from 'express';
import {
    createOrder,
    getOrder,
    getOrders,
    getMyOrders,
    getPublicOrders,
    getAdminStats,
    getReports,
    updateOrderStatus 
} from '../controllers/orderController.js';
import { protect, optionalProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/public/active', getPublicOrders);

router.post('/', optionalProtect, createOrder);

router.use(protect);

router.get('/my-orders', getMyOrders);
router.get('/admin/stats', getAdminStats);
router.get('/admin/reports', getReports);
router.get('/admin/orders', getOrders); 
router.get('/:id', getOrder);

router.patch('/:id/status', updateOrderStatus);

export default router;