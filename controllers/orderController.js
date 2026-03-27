import { orderSchema } from '../validations/orderValidation.js';
import * as orderService from '../services/orderService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
    const validatedData = orderSchema.parse(req.body);
    const queueSize = orderService.addOrderToBuffer(validatedData);
    res.status(202).json({ 
        success: true,
        message: "Order queued successfully",
        queueSize
    });
});