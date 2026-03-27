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

export const getOrder=asyncHandler(async (req,res)=>{
    const {id} = req.params;
    const order=await orderService.getOrderById(id);
    if(!order){
        const error=new Error("Order not found");
        error.statusCode=404;
        throw error;
    }
    res.status(200).json({
        success:true,
        data:order
    });
});