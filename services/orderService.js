import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import { getIO } from '../lib/socket.js';

let orderBuffer = [];

export const addOrderToBuffer = (orderData) => {
    orderBuffer.push({
        ...orderData,
        status: "PREPARING"
    });
    return orderBuffer.length;
};

export const syncOrdersWithDb = async () => {
    if (orderBuffer.length === 0) return;
    logger.info(`🚀 Syncing ${orderBuffer.length} orders...`);
    try {
        await prisma.order.createMany({ data: orderBuffer });
        orderBuffer = [];
        logger.info("✅ Buffer cleared.");
    } catch (error) {
        throw new Error(`Database Sync Failed: ${error.message}`);
    }
};

setInterval(syncOrdersWithDb, 10000);

export const createPublicOrder = async (customerName) => {
    const lastOrder = await prisma.order.findFirst({
        orderBy: { queueNumber: 'desc' }
    });
    const queueNumber = (lastOrder?.queueNumber || 0) + 1;
    return await prisma.order.create({
        data: { customerName, queueNumber, status: 'PREPARING' }
    });
};

export const getPublicOrders = async () => {
    return await prisma.order.findMany({
        where: { status: { in: ['PREPARING', 'READY'] } },
        select: { queueNumber: true, status: true, id: true, customerName: true }
    });
};

export const getPendingCount = async () => {
    return await prisma.order.count({ where: { status: 'PREPARING' } });
};

export const getOrderById = async (id) => {
    return await prisma.order.findUnique({ where: { id } });
};

export const getAllOrders = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count()
    ]);
    return {
        orders,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
};

export const getUserOrders = async (userId) => {
    return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

export const updateOrderStatus = async (orderId, status) => {
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status }
    });
    const io = getIO();
    io.to(updatedOrder.userId).emit('status_updated', {
        orderId: updatedOrder.id,
        newStatus: status,
        message: `Your order status has been updated to ${status}`
    });
    return updatedOrder;
};

export const getAdminStats = async () => {
    const [totalOrders, preparing, ready, completed] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PREPARING' } }),
        prisma.order.count({ where: { status: 'READY' } }),
        prisma.order.count({ where: { status: 'COMPLETED' } }),
    ]);

    return {
        totalOrders,
        preparing,
        ready,
        completed,
        avgWaitTime: 5
    };
};