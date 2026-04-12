import React from 'react';

const StatsChart = ({ data }) => {
    if (!data) return null;

    const items = [
        { label: 'In Progress', value: data.preparing || 0, color: 'bg-amber-500' },
        { label: 'Ready', value: data.ready || 0, color: 'bg-emerald-500' },
        { label: 'Completed', value: data.completed || 0, color: 'bg-blue-600' },
    ];

    const max = Math.max(...items.map(i => i.value), 1);

    return (
        <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="font-black text-sm uppercase tracking-widest text-white">Order Insights</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase bg-white/5 px-3 py-1 rounded-lg tracking-tighter">Real-time Data</span>
            </div>

            <div className="space-y-8">
                {items.map((item) => (
                    <div key={item.label} className="group">
                        <div className="flex justify-between mb-3 items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                            <span className="font-black text-2xl text-white tracking-tighter">{item.value}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3">
                            <div
                                className={`${item.color} h-3 rounded-full transition-all duration-700 ease-in-out shadow-lg`}
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-gradient-to-b from-white/5 to-transparent rounded-3xl text-center border border-white/5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Total Cumulative Orders</p>
                <p className="text-6xl font-black text-white mt-3 tracking-tighter">{data.totalOrders || 0}</p>
            </div>
        </div>
    );
};

export default StatsChart;