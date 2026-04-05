import React from 'react';

const StatsChart = ({ data }) => {
    if (!data) return null;

    const items = [
        { label: 'قيد التحضير', value: data.preparing || 0, color: 'bg-amber-500' },
        { label: 'جاهز', value: data.ready || 0, color: 'bg-emerald-500' },
        { label: 'مكتمل', value: data.completed || 0, color: 'bg-blue-500' },
    ];

    const max = Math.max(...items.map(i => i.value), 1);

    return (
        <div className="bg-slate-800/50 rounded-[2rem] border border-slate-700 p-6">
            <div className="p-2 border-b border-slate-700 font-bold mb-6">إحصائيات الطلبات</div>
            <div className="space-y-6">
                {items.map((item) => (
                    <div key={item.label}>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-400">{item.label}</span>
                            <span className="font-bold text-white">{item.value}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4">
                            <div
                                className={`${item.color} h-4 rounded-full transition-all duration-500`}
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">إجمالي الطلبات</p>
                <p className="text-5xl font-black text-white mt-2">{data.totalOrders || 0}</p>
            </div>
        </div>
    );
};

export default StatsChart;