import * as orderService from '../services/orderService.js';
import { orderSchema } from '../validations/orderValidation.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
    const validatedData = orderSchema.parse(req.body);
    const queueSize = orderService.addOrderToBuffer({
        ...validatedData,
        userId: req.userId
    });
    res.status(202).json({
        success: true,
        message: "Order queued successfully",
        currentQueue: queueSize
    });
});

export const createPublicOrder = asyncHandler(async (req, res) => {
    const { customerName } = req.body;
    const order = await orderService.createPublicOrder(customerName);
    res.status(201).json(order);
});

export const getPublicOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getPublicOrders();
    res.json(orders);
});

export const getPendingCount = asyncHandler(async (req, res) => {
    const count = await orderService.getPendingCount();
    res.json({ count });
});

export const getOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({ success: true, data: order });
});

export const getOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await orderService.getAllOrders(page, limit);
    res.status(200).json({ success: true, ...result });
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getUserOrders(req.userId);
    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

export const getWaitingCount = asyncHandler(async (req, res) => {
    const count = await orderService.getPendingCount();
    res.json({ waitingCount: count });
});

export const getAdminStats = asyncHandler(async(req,res)=>{
    const totalOrders=await prisma.order.count();
    const today=new Date();
    today.setHours(0,0,0,0);
    const completedToday=await prisma.order.count({
        where:{
            status:'COMPLETED',
            updatedAt:{gte:today}
        }
    });

    const statusDistribution= await prisma.order.groupBy({
        by:['status'],
        _count:{id:true}
    });

    res.json({
        totalOrders,
        completedToday,
        statusDistribution
    });
});

