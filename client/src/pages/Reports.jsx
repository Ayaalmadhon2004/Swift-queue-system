import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ReportSkeleton from "../components/ReportSkeleton";

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const { data } = await api.get('/orders/admin/reports');
                setReportData(data.data);
            } catch (err) {
                console.error("Error fetching reports:", err);
            }
        };
        fetchReports();
    }, []);

    if (loading || !reportData) {
    return <ReportSkeleton/>;
    }
    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white" dir="rtl">
            <h1 className="text-3xl font-black mb-10">تقارير الأداء الذكية 📈</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-4 text-blue-400">حجم الطلبات (آخر 7 أيام)</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={reportData.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-4 text-emerald-400">توزيع حالات الطلبات</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={reportData.statusDistribution} dataKey="_count.id" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                                    {reportData.statusDistribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;