import { orderSchema } from '../validations/orderValidation.js';
import * as orderService from '../services/orderService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
    const validatedData = orderSchema.parse(req.body);
    const queueSize = orderService.addOrderToBuffer({
        ...validatedData,
        userId:req.userId
    });
    res.status(202).json({ 
        success: true,
        message: "Order queued successfully",
        currentQueue:queueSize
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


export const getOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await orderService.getAllOrders(page, limit);

    res.status(200).json({
        success: true,
        ...result
    });
});

export const getMyOrders=asyncHandler(async(req,res)=>{
    const orders=await orderService.getUserOrders(req.userId);

    res.status(200).json({
        success:true,
        count:orders.length,
        data:orders
    });
});

export const getWaitingCount = async (req, res) => {
    try {
        const count = await prisma.order.count({
            where: { status: 'PREPARING' }
        });
        res.json({ waitingCount: count });
    } catch (error) {
        res.status(500).json({ error: "Error counting orders" });
    }
};