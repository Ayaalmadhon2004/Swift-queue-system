import prisma from "../lib/prisma";

export const generatePerformanceReport = async () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const [totalState, dailyStats, statusDistribution] = await Promise.all([
        prisma.order.aggregate({ 
            where: { createdAt: { gte: lastWeek } },
            _count: { id: true },
        }),

        prisma.$queryRaw`
            SELECT DATE("createdAt") as date, COUNT(id)::int as count
            FROM "Order"
            WHERE "createdAt" >= ${lastWeek}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `,

        prisma.order.groupBy({
            by: ['status'],
            _count: { id: true },
        })
    ]);

    return {
        totalOrders: totalState._count.id,
        dailyStats,
        statusDistribution: statusDistribution.map(item => ({
            status: item.status,
            count: item._count.id
        }))
    };
};