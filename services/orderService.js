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


export const getOrderById=async(id)=>{
    const order=await prisma.order.findUnique({
        where:{id:id},
    })
    return order;
}

export const getAllOrders = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            take: limit,
            skip: skip,
            orderBy: { createdAt: 'desc' } 
        }),
        prisma.order.count() 
    ]);

    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const getUserOrders=async(userId)=>{
    return await prisma.order.findMany({
        where:{userId:userId},
        orderBy:{createdAt:'desc'},
        include:{
            product:true
        }
    });
};