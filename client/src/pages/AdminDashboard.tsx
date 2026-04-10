import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axiosConfig'; 
import toast from 'react-hot-toast';
import { CSVLink } from "react-csv";
import StatsChart from '../components/StatsChart';
import { requestNotificationPermission, sendNotification } from '../utils/notifications';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const socket = useSocket();

    const fetchDashboardData = async () => {
        try {
            // الطلبات ستستخدم الـ Cookies تلقائياً بفضل axiosConfig
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/orders/admin/stats'),
                api.get('/orders/my-orders') 
            ]);

            setStats(statsRes.data);
            const allOrders = ordersRes.data.data || ordersRes.data;
            setOrders(allOrders);

            // تحسين تصدير التقرير ليدعم اللغة العربية في Excel
            const formattedReport = allOrders.map((o) => ({
                "رقم الدور": o.queueNumber,
                "اسم الزبون": o.customerName || "زائر",
                "الحالة": o.status === 'pending' ? 'انتظار' : 'مكتمل',
                "وقت الحجز": new Date(o.createdAt).toLocaleString('ar-EG'),
            }));
            setReportData(formattedReport);

        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            // إذا انتهت جلسة الـ Cookie سيتم توجيهكِ هنا
            if (err.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        requestNotificationPermission();

        if (socket) {
            socket.on('orderStatusChanged', fetchDashboardData);
            socket.on('newOrder', (newOrder) => {
                fetchDashboardData();
                // صوت تنبيه احترافي
                new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
                
                sendNotification("طلب جديد! 🆕", {
                    body: `الزبون: ${newOrder.customerName} | رقم: ${newOrder.queueNumber}`,
                });
                toast.success(`وصول طلب جديد رقم #${newOrder.queueNumber}`, { duration: 5000 });
            });
        }

        return () => {
            if (socket) {
                socket.off('orderStatusChanged');
                socket.off('newOrder');
            }
        };
    }, [socket]);

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}`, { status });
            toast.success("تم تحديث الحالة بنجاح");
            fetchDashboardData();
        } catch (err) {
            toast.error("حدث خطأ أثناء التحديث");
        }
    };

    if (loading || !stats) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
                <p className="text-slate-500 animate-pulse">جاري تحميل بيانات النظام...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                
                {/* Header المطور */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-10">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">لوحة التحكم 🛠️</h1>
                        <p className="text-slate-400 mt-3 text-lg">أهلاً بكِ في نظام "Gaza Pulse". أنتِ الآن تديرين الطابور الحي.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <CSVLink 
                            data={reportData} 
                            filename={`GazaPulse-Report-${new Date().toISOString().split('T')[0]}.csv`}
                            uFEFF={true}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-2xl shadow-emerald-900/40"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span>تصدير التقارير</span>
                        </CSVLink>

                        <button onClick={logout} className="bg-slate-900/50 hover:bg-red-950/30 hover:text-red-400 px-8 py-3.5 rounded-2xl font-bold transition-all border border-slate-800 text-slate-400">
                            تسجيل الخروج
                        </button>
                    </div>
                </header>

                {/* كروت الإحصائيات (Stats Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <p className="text-slate-500 text-sm font-bold mb-2 uppercase tracking-widest">إجمالي الطلبات</p>
                        <h3 className="text-7xl font-black text-blue-500 tracking-tighter">{stats.totalOrders}</h3>
                    </div>
                    
                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] backdrop-blur-sm relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <p className="text-slate-500 text-sm font-bold mb-2 uppercase tracking-widest">متوسط الانتظار</p>
                        <h3 className="text-7xl font-black text-emerald-500 tracking-tighter">{stats.avgWaitTime}<span className="text-xl ml-2">د</span></h3>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <p className="text-slate-500 text-sm font-bold mb-2 uppercase tracking-widest">بانتظار الخدمة</p>
                        <h3 className="text-7xl font-black text-amber-500 tracking-tighter">
                            {orders.filter(o => o.status === 'pending').length}
                        </h3>
                    </div>
                </div>

                {/* القسم الرئيسي (Live List & Chart) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* قائمة الطلبات الحية */}
                    <div className="lg:col-span-5 bg-[#0A0A0A] border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col h-[700px] shadow-2xl">
                        <div className="p-8 border-b border-slate-800 bg-slate-900/20 backdrop-blur-xl sticky top-0 z-10">
                            <h2 className="text-2xl font-black flex items-center gap-4">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                                الطلبات النشطة
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {orders.filter(o => o.status === 'pending').length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700">
                                    <span className="text-6xl mb-4">✨</span>
                                    <p className="font-bold">جميع الطلبات مكتملة!</p>
                                </div>
                            ) : (
                                orders.filter(o => o.status === 'pending').map((order) => (
                                    <div key={order.id} className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500/50 transition-all duration-300 group shadow-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">#{order.queueNumber}</span>
                                                <h4 className="text-xl font-black text-white mt-2 group-hover:text-blue-400 transition-colors">{order.customerName || "زبون مجهول"}</h4>
                                            </div>
                                            <p className="text-[10px] text-slate-600 font-bold">{new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            إتمام الخدمة ✅
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* الرسم البياني والتقارير */}
                    <div className="lg:col-span-7 bg-[#0A0A0A] border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                        <h2 className="text-2xl font-black mb-10 flex items-center gap-4">
                            تحليلات الأداء 📈
                        </h2>
                        <div className="h-[500px] w-full">
                            <StatsChart data={stats} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;