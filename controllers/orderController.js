import prisma from '../lib/prisma.js';
import { orderSchema } from '../validations/orderValidation.js';

let orderBuffer = [];

const processOrders = async () => {
    if (orderBuffer.length > 0) {
        console.log(`🚀 Sending ${orderBuffer.length} validated orders to Neon...`);
        
        try {
            await prisma.order.createMany({
                data: orderBuffer
            });
            
            orderBuffer = []; 
            console.log("✅ Database synced and Queue cleared.");
        } catch (error) {
            console.error("❌ Failed to sync with Neon:", error.message);
        }
    }
};

setInterval(processOrders, 10000);

export const createOrder = async (req, res) => {
    try {
        // 1. الفحص أولاً (Zod) - إذا فشل سيقفز للـ catch فوراً
        const validatedData = orderSchema.parse(req.body);

        // 2. إذا نجح، نضعه في الـ Buffer (لا نرسله لـ Neon الآن)
        orderBuffer.push({
            userId: validatedData.userId,
            productId: validatedData.productId,
            status: "pending"
        });

        res.status(202).json({ 
            message: "Order received and validated. It will be processed shortly.",
            queueSize: orderBuffer.length 
        });

    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                error: "Validation Failed",
                details: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({ error: "Server Error" });
    }
};