import * as reportService from '../services/reportService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getReports=asyncHandler(async(req,res)=>{
    const reportData=await reportService.generatePerformanceReport();

    res.status(200).json({
        success:true,
        data:reportData
    });
});