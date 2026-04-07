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
            customerName: item.customerName,
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

export const createPublicOrder = async (customerName) => {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { queueNumber: 'desc' }
  });
  const queueNumber = (lastOrder?.queueNumber || 0) + 1;

  const order = await prisma.order.create({
    data: { customerName, queueNumber, status: 'PREPARING' }
  });

  try {
    const io = getIO();
    io.emit('newOrder', {
      id: order.id,
      customerName: order.customerName,
      queueNumber: order.queueNumber,
      status: order.status,
      createdAt: order.createdAt
    });
  } catch (err) {
    logger.warn('Socket emit failed in createPublicOrder', err);
  }

  return order;
};

export const getPublicOrders = async () => {
  return await prisma.order.findMany({
    where: { status: { in: ['PREPARING', 'READY'] } },
    select: { queueNumber: true, status: true, id: true, customerName: true, createdAt: true }
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

  try {
    const io = getIO();
    if (updatedOrder.userId) {
      io.to(updatedOrder.userId).emit('status_updated', {
        orderId: updatedOrder.id,
        newStatus: status,
        message: `Your order status has been updated to ${status}`
      });
    }
    io.emit('orderStatusChanged', {
      orderId: updatedOrder.id,
      newStatus: status
    });
  } catch (err) {
    logger.warn('Socket emit failed in updateOrderStatus', err);
  }

  return updatedOrder;
};

export const getAdminStats = async () => {
  const [totalOrders, preparing, ready, completed] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PREPARING' } }),
    prisma.order.count({ where: { status: 'READY' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } })
  ]);

  return {
    totalOrders,
    preparing,
    ready,
    completed,
    avgWaitTime: 5
  };
};