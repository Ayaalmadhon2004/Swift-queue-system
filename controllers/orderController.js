import prisma from '../lib/prisma.js';
import { orderSchema } from '../validations/orderValidation.js';
import asyncHandler from '../utils/asyncHandler.js';
// 1. استيراد orderBuffer مرة واحدة فقط من الخدمة
import { orderBuffer } from '../services/orderService.js'; 

// ❌ تم حذف السطر المكرر import { orderBuffer } والتعريف let orderBuffer لحل خطأ الـ Identifier already declared

// 1. جلب إحصائيات الأدمن
export const getAdminStats = asyncHandler(async (req, res) => {
    try {
        const [totalOrders, preparing, ready, completed] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PREPARING' } }),
            prisma.order.count({ where: { status: 'READY' } }),
            prisma.order.count({ where: { status: 'COMPLETED' } })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalOrders: totalOrders || 0,
                preparing: preparing || 0,
                ready: ready || 0,
                completed: completed || 0,
                avgWaitTime: 15
            }
        });
    } catch (error) {
        console.error("Critical Error in getAdminStats:", error.message);
        return res.status(500).json({ success: false, message: "خطأ في قاعدة البيانات" });
    }
});

// 2. جلب كافة الطلبات
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
    });
    return res.status(200).json({ success: true, data: orders });
});

// 3. جلب طلب واحد بالمعرف
export const getOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    return res.status(200).json({ success: true, data: order });
});

// 4. جلب الطلبات العامة للشاشة
export const getPublicOrders = asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { status: { in: ['PREPARING', 'READY'] } },
        orderBy: { createdAt: 'asc' }
    });
    return res.status(200).json({ success: true, data: orders });
});

// 5. جلب طلبات المستخدم الحالي (التي تربط بين الـ Buffer وقاعدة البيانات)
export const getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    
    let dbOrders = [];
    if (userId) {
        dbOrders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    } else {
        // الحل: جلب آخر 5 طلبات في النظام لضمان ظهور طلبات الـ Guest
        dbOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
    }

    // دمج نتائج الـ Buffer مع قاعدة البيانات
    const bufferedOrders = orderBuffer.filter(order => order.userId === userId || (!userId && !order.userId));
    const allOrders = [...bufferedOrders, ...dbOrders];

    return res.status(200).json({ 
        success: true, 
        data: allOrders 
    });
});

// 6. إنشاء طلب جديد
export const createOrder = asyncHandler(async (req, res) => {
    const validatedData = orderSchema.parse(req.body);
    
    // بدلاً من الـ Transaction المعقد، سنجلب آخر رقم ببساطة
    const lastOrder = await prisma.order.findFirst({
        orderBy: { queueNumber: 'desc' }
    });
    
    const nextQueue = (lastOrder?.queueNumber || 0) + 1;

    // إنشاء الطلب مباشرة
    const newOrder = await prisma.order.create({
        data: {
            ...validatedData,
            queueNumber: nextQueue,
            status: 'PREPARING',
            userId: req.user?.id || null,
            customerName: req.body.customerName || "Guest"
        }
    });

    try {
        const io = req.app.get('socketio');
        if (io) io.emit('orderStatusChanged', newOrder);
    } catch (err) {
        console.error("Socket error:", err);
    }

    return res.status(201).json({ success: true, data: newOrder });
});

// 7. تحديث حالة الطلب
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status }
    });
    return res.status(200).json({ success: true, data: updatedOrder });
});

// 8. جلب التقارير
export const getReports = asyncHandler(async (req, res) => {
    const reports = await prisma.order.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ success: true, data: reports });
});

// 9. جلب عدد الطلبات المنتظرة (لحل مشكلة الـ 404 في التيكت)
export const getPendingCount = asyncHandler(async (req, res) => {
    try {
        // نستخدم prisma لحساب الطلبات التي حالتها PREPARING (أو حسب الحالة لديكِ)
        const count = await prisma.order.count({
            where: { 
                status: 'PREPARING' 
            }
        });

        return res.status(200).json({
            success: true,
            count: count || 0
        });
    } catch (error) {
        console.error("Error in getPendingCount:", error.message);
        return res.status(500).json({ success: false, message: "خطأ في جلب العداد" });
    }
});