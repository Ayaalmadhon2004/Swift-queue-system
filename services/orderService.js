import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import { getIO } from '../lib/socket.js'; 

let orderBuffer = [];

export const addOrderToBuffer = (orderData) => {
  const buffered = {
    ...orderData,
    status: 'PREPARING'
  };
  orderBuffer.push(buffered);
  try {
    const io = getIO();
    io.emit('newOrder', {
      ...buffered,
      tempId: `buffer-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });
  } catch (err) {
    logger.warn('Socket emit failed in addOrderToBuffer', err);
  }
  return orderBuffer.length;
};

// مزامنة الطلبات الموجودة في الـ Buffer مع قاعدة البيانات كل 10 ثوانٍ
export const syncOrdersWithDb = async () => {
  if (orderBuffer.length === 0) return;
  
  logger.info(`🚀 Syncing ${orderBuffer.length} orders from buffer...`);
  const toCreate = [...orderBuffer];
  orderBuffer = [];

  try {
    const createdOrders = await prisma.$transaction(async (tx) => {
      const lastOrder = await tx.order.findFirst({
        orderBy: { queueNumber: 'desc' },
        lock: { mode: 'update' } 
      });

      let nextQueue = (lastOrder?.queueNumber || 0) + 1;

      return Promise.all(
        toCreate.map(item => tx.order.create({
          data: {
            customerName: item.customerName || item.guestName || "Guest",
            status: item.status,
            queueNumber: nextQueue++,
            userId: item.userId || null,
            ...(item.items ? { items: item.items } : {})
          }
        }))
      );
    });

    try {
      const io = getIO();
      io.emit('ordersSynced', createdOrders); 
    } catch (err) {
      logger.warn('⚠️ Socket notification failed after sync', err);
    }
    logger.info(`✅ Successfully synced ${createdOrders.length} orders.`);
  } catch (error) {
    orderBuffer = [...toCreate, ...orderBuffer];
    logger.error(`❌ Sync Failed: ${error.message}. Data restored to buffer.`);
  }
};

setInterval(syncOrdersWithDb, 10000);

export const createNewOrder = async (orderData) => {
  const lastOrder = await prisma.order.findFirst({ orderBy: { queueNumber: 'desc' } });
  const queueNumber = (lastOrder?.queueNumber || 0) + 1;

  const order = await prisma.order.create({
    data: { ...orderData, queueNumber }
  });

  try {
    const io = getIO();
    io.emit('newOrder', order);
  } catch (err) {
    logger.warn('Socket emit failed in createNewOrder', err);
  }
  return order;
};

export const getPublicOrders = async () => {
  return await prisma.order.findMany({
    where: { status: { in: ['PREPARING', 'READY'] } },
    select: { queueNumber: true, status: true, id: true, customerName: true, createdAt: true }
  });
};

export const getUserOrders = async (userId) => {
  if (!userId) return []; 
  return await prisma.order.findMany({ 
    where: { userId }, 
    orderBy: { createdAt: 'desc' } 
  });
};

export const updateOrderStatus = async (orderId, status) => {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { user: true }
  });

  try {
    const io = getIO();
    if (updatedOrder.userId) { 
      io.to(updatedOrder.userId).emit('status_updated', {
        orderId: updatedOrder.id,
        newStatus: status,
        queueNumber: updatedOrder.queueNumber
      });
    }
    io.emit('orderStatusChanged', { 
        orderId: updatedOrder.id, 
        newStatus: status,
        queueNumber: updatedOrder.queueNumber 
    });
  } catch (err) {
    logger.warn('Socket emit failed in updateOrderStatus', err);
  }
  return updatedOrder;
};

export const getEstimatedWaitTime = async () => {
  const completedOrders = await prisma.order.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: { createdAt: true, updatedAt: true }
  });

  if (completedOrders.length === 0) return 15;

  const totalMinutes = completedOrders.reduce((acc, order) => {
    const diff = new Date(order.updatedAt) - new Date(order.createdAt);
    return acc + (diff / 1000 / 60);
  }, 0);

  return Math.round(totalMinutes / completedOrders.length);
};

export const getAdminStats = async () => {
  const [totalOrders, preparing, ready, completed] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PREPARING' } }),
    prisma.order.count({ where: { status: 'READY' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } })
  ]);

  const avgWaitTime = await getEstimatedWaitTime();
  return { totalOrders, preparing, ready, completed, avgWaitTime };
};

export const getReportsData = async () => {
  const stats = await prisma.order.groupBy({
    by: ['createdAt'],
    _count: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  const statusDist = await prisma.order.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  return {
    dailyStats: stats.map(s => ({
      date: s.createdAt.toISOString().split('T')[0],
      count: s._count.id
    })),
    statusDistribution: statusDist.map(d => ({
        status: d.status,
        count: d._count.id
    }))
  };
};

export const getOrderById = async (id) => {
  return await prisma.order.findUnique({ where: { id } });
};

export const getAllOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ take: limit, skip, orderBy: { createdAt: 'desc' } }),
    prisma.order.count()
  ]);
  return { orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};