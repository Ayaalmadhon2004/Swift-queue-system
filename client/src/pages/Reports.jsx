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
        <div className="p-8 bg-slate-900 min-h-screen text-white">
            <header className="mb-10">
                <h1 className="text-3xl font-black mb-2 text-white">Smart Performance Reports 📈</h1>
                <p className="text-slate-400">Real-time analysis of distribution data and queue management.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-blue-400">Order Volume (Last 7 Days)</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={reportData.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-emerald-400">Order Status Distribution</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={reportData.statusDistribution} 
                                    dataKey="_count.id" 
                                    nameKey="status" 
                                    cx="50%" cy="50%" 
                                    innerRadius={70} outerRadius={100} 
                                    paddingAngle={5} label
                                >
                                    {reportData.statusDistribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">Avg. Waiting Time</p>
                    <h3 className="text-2xl font-bold text-orange-400">12.5 min</h3>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">Completed Today</p>
                    <h3 className="text-2xl font-bold text-emerald-400">148 Orders</h3>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">User Satisfaction</p>
                    <h3 className="text-2xl font-bold text-blue-400">94%</h3>
                </div>
            </div>
        </div>
    );
};

export default Reports;