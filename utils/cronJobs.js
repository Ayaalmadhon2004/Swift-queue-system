import cron from 'node-cron'; 
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';

export const initCronJobs=()=>{
    cron.schedule('0 0 * * *',async()=>{
        logger.info("Cron:starting cleanup of old cancelled orders...");
        try{
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const deleted = await prisma.order.deleteMany({
                where:{
                    status:'cancelled',
                    updatedAt:{lt:yesterday}
                }
            });
            logger.info(`Cron:deleted ${deleted.count} old cancelled orders.`);
        } catch(error){
            logger.error(`Cron Error : ${error.message}`);
        }
    });
};