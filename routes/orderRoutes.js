import express from 'express';
import {
    createOrder,
    getOrder,
    getOrders,
    getMyOrders,
    getWaitingCount,
    createPublicOrder,
    getPublicOrders,
    getPendingCount,
    getAdminStats,
    getReports
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/public', getPublicOrders);
router.get('/count/pending', getPendingCount);
router.post('/public/create', createPublicOrder);

router.use(protect);

router.get('/admin/stats', getAdminStats);
router.get('/admin/reports', getReports);
router.get('/my-orders', getMyOrders);
router.get('/count/waiting', getWaitingCount);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);

export default router;