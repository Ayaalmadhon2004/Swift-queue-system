import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';

let orderBuffer = [];

export const addOrderToBuffer = (orderData) => {
    orderBuffer.push({
        ...orderData,
        status: "pending"
    });
    return orderBuffer.length;
};

export const syncOrdersWithDb = async () => {
    if (orderBuffer.length === 0) return;

    logger.info(`🚀 Service: Syncing ${orderBuffer.length} orders...`);
    try {
        await prisma.order.createMany({ data: orderBuffer });
        orderBuffer = [];
        logger.info("✅ Service: Buffer cleared.");
    } catch (error) {
        throw new Error(`Database Sync Failed: ${error.message}`);
    }
};

setInterval(syncOrdersWithDb, 10000);