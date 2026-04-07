import { useEffect, useState } from "react"

const Reports = () =>{
    const [reportData,setReportData] = useState(null);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(()=>{
        const fetchReports = async ()=>{
            const {data} = await api.get('/orders/admin/reports');
            setReportData(data.data);
        };
        fetchReports();
    },[]);

    if (!reportData) return <div className="text-white p-10">جاري تحليل البيانات...</div>;

    return (
       <div className="p-8 bg-slate-900 min-h-screen text-white" dir="rtl">
            <h1 className="text-3xl font-black mb-10">تقارير الأداء الذكية 📊</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* مخطط نمو الطلبات اليومي */}
                <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700">
                    <h2 className="text-xl font-bold mb-6">حجم الطلبات (آخر 7 أيام)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
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

                {/* توزيع الحالات */}
                <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 flex flex-col items-center">
                    <h2 className="text-xl font-bold mb-6">توزيع حالات الطلبات</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reportData.statusDistribution}
                                    dataKey="_count.id"
                                    nameKey="status"
                                    cx="50%" cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {reportData.statusDistribution.map((entry, index) => (
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