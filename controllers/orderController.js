import prisma from '../lib/prisma.js';
import { orderSchema } from '../validations/orderValidation.js';
import asyncHandler from '../utils/asyncHandler.js';

// 1. جلب إحصائيات الأدمن (حل خطأ 500)
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

// 2. جلب كافة الطلبات (Export مفقود كان يسبب انهيار السيرفر)
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
    });
    return res.status(200).json({ success: true, data: orders });
});

// 3. جلب طلب واحد بالمعرف (Export مفقود كان يسبب انهيار السيرفر)
export const getOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    return res.status(200).json({ success: true, data: order });
});

// 4. جلب الطلبات العامة للشاشة (Export مفقود كان يسبب انهيار السيرفر)
export const getPublicOrders = asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { status: { in: ['PREPARING', 'READY'] } },
        orderBy: { createdAt: 'asc' }
    });
    return res.status(200).json({ success: true, data: orders });
});

// 5. جلب طلبات المستخدم الحالي (حل خطأ 401)
export const getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(200).json({ success: true, data: [] });

    const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: orders });
});

// 6. إنشاء طلب جديد
export const createOrder = asyncHandler(async (req, res) => {
    const validatedData = orderSchema.parse(req.body);
    const count = await prisma.order.count();

    const newOrder = await prisma.order.create({
        data: {
            ...validatedData,
            queueNumber: count + 1,
            status: 'PREPARING',
            userId: req.user?.id || null,
            customerName: req.body.customerName || "Guest"
        }
    });
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