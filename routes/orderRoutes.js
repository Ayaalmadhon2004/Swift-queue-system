import express from 'express';
import {
    createOrder,
    getOrder,
    getOrders,
    getMyOrders,
    getPublicOrders,
    getAdminStats,
    getReports,
    updateOrderStatus,
    getPendingCount // تأكد من استيراد هذه الدالة
} from '../controllers/orderController.js';
import { protect, optionalProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- المسارات العامة (Public) ---
router.get('/public/active', getPublicOrders);

// هذا المسار لحل مشكلة الـ 404 عند جلب عدد المنتظرين
router.get('/count/pending', getPendingCount); 

// هذا المسار لحل مشكلة الـ 404 عند إنشاء تذكرة جديدة
router.post('/public/create', optionalProtect, createOrder); 

// --- المسارات المحمية (Protected) ---
router.use(protect);

router.get('/my-orders', getMyOrders);
router.get('/admin/stats', getAdminStats);
router.get('/admin/reports', getReports);
router.get('/admin/orders', getOrders); 
router.get('/:id', getOrder);

router.patch('/:id/status', updateOrderStatus);

export default router;