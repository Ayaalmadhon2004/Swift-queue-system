import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import ReportSkeleton from "../components/ReportSkeleton";

const Reports = () => {
    // تعريف الحالات (States)
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true); // حل مشكلة ReferenceError
    
    // الألوان الخاصة بهوية Gaza Pulse (الأزرق، الأخضر، البرتقالي، الأحمر)
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                // جلب البيانات من المسار المخصص للتقارير
                const { data } = await api.get('/orders/admin/reports');
                setReportData(data.data);
            } catch (err) {
                console.error("Error fetching reports:", err);
            } finally {
                setLoading(false); // إيقاف التحميل سواء نجح الطلب أو فشل
            }
        };
        fetchReports();
    }, []);

    // عرض الهيكل المؤقت أثناء التحميل أو في حال عدم وجود بيانات
    if (loading || !reportData) {
        return <ReportSkeleton />;
    }

    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white" dir="rtl">
            <header className="mb-10">
                <h1 className="text-3xl font-black mb-2 text-white">تقارير الأداء الذكية 📈</h1>
                <p className="text-slate-400">تحليل لحظي لبيانات توزيع المساعدات وإدارة الطوابير.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* مخطط حجم الطلبات (Line Chart) */}
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-blue-400">حجم الطلبات (آخر 7 أيام)</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={reportData.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8" 
                                    tick={{fontSize: 12}}
                                    tickMargin={10}
                                />
                                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4} 
                                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* مخطط توزيع حالات الطلبات (Pie Chart) */}
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-emerald-400">توزيع حالات الطلبات</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={reportData.statusDistribution} 
                                    dataKey="_count.id" 
                                    nameKey="status" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={70}
                                    outerRadius={100} 
                                    paddingAngle={5}
                                    label
                                >
                                    {reportData.statusDistribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* إحصائيات سريعة (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">متوسط وقت الانتظار</p>
                    <h3 className="text-2xl font-bold text-orange-400">12.5 دقيقة</h3>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">الطلبات المكتملة اليوم</p>
                    <h3 className="text-2xl font-bold text-emerald-400">148 طلب</h3>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">معدل رضا المستخدمين</p>
                    <h3 className="text-2xl font-bold text-blue-400">94%</h3>
                </div>
            </div>
        </div>
    );
};

export default Reports;