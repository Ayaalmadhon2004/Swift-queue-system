import prisma from '../lib/prisma.js';
import { orderSchema } from '../validations/orderValidation.js';
import logger from '../lib/logger.js'; 
let orderBuffer = [];

const processOrders = async () => {
    if (orderBuffer.length > 0) {
        logger.info(`🚀 Attempting to sync ${orderBuffer.length} orders with Neon...`);
        
        try {
            await prisma.order.createMany({
                data: orderBuffer
            });
            
            logger.info(`✅ Successfully synced ${orderBuffer.length} orders. Queue cleared.`);
            orderBuffer = []; 
        } catch (error) {
            logger.error(`❌ Database Sync Failed: ${error.message}`);
        }
    } else {
        logger.debug("😴 Buffer is empty, skipping sync.");
    }
};

setInterval(processOrders, 10000);

export const createOrder = async (req, res) => {
    try {
        const validatedData = orderSchema.parse(req.body);

        orderBuffer.push({
            userId: validatedData.userId,
            productId: validatedData.productId,
            status: "pending"
        });

        logger.info(`📥 Order added to buffer: User ${validatedData.userId}`);

        res.status(202).json({ 
            message: "Order received and validated. It will be processed shortly.",
            queueSize: orderBuffer.length 
        });

    } catch (error) {
        if (error.name === "ZodError") {
            const errorDetails = error.errors.map(e => e.message);
            
            logger.warn(`⚠️ Validation Failed: ${JSON.stringify(errorDetails)}`);

            return res.status(400).json({
                error: "Validation Failed",
                details: errorDetails
            });
        }

        logger.error(`🔥 Unexpected Server Error: ${error.message}`);
        res.status(500).json({ error: "Server Error" });
    }
};