import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import ReportSkeleton from "../components/ReportSkeleton";

const Reports = () => {
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['adminReports'],
        queryFn: async () => {
            const { data } = await api.get('/orders/admin/reports');
            return data.data;
        }
    });

    if (isLoading || !reportData) return <ReportSkeleton />;

    return (
        <div className="p-8 bg-[#050505] min-h-screen text-white">
            <header className="mb-10">
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                    System Analytics<span className="text-blue-600">.</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">Real-time performance metrics and distribution logs.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Volume Chart */}
                <div className="bg-[#0A0A0A] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                    <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-8">Weekly Traffic Volume</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={reportData.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                                <XAxis dataKey="date" stroke="#475569" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#475569" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
                                    itemStyle={{ color: '#fff', fontWeight: '800' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4} 
                                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} 
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution Chart */}
                <div className="bg-[#0A0A0A] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                    <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-8">Operational Status Distribution</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={reportData.statusDistribution} 
                                    dataKey="_count.id" 
                                    nameKey="status" 
                                    cx="50%" cy="50%" 
                                    innerRadius={80} outerRadius={110} 
                                    paddingAngle={8}
                                >
                                    {reportData.statusDistribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '16px' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Metric Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <MetricCard label="Avg. Response Time" value="12.5m" color="text-amber-500" />
                <MetricCard label="Throughput Today" value="148" color="text-emerald-500" suffix="units" />
                <MetricCard label="System Reliability" value="94%" color="text-blue-500" />
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, color, suffix = "" }) => (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] transition-all hover:bg-white/[0.04]">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
            <h3 className={`text-4xl font-black tracking-tighter ${color}`}>{value}</h3>
            {suffix && <span className="text-slate-600 text-xs font-bold uppercase">{suffix}</span>}
        </div>
    </div>
);

export default Reports;