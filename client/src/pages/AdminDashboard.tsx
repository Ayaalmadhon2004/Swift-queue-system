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
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/orders/admin/stats'),
                api.get('/orders/my-orders') 
            ]);

            setStats(statsRes.data);
            const allOrders = ordersRes.data.data || ordersRes.data;
            setOrders(allOrders);

            const formattedReport = allOrders.map((o: any) => ({
                "رقم الدور": o.queueNumber,
                "اسم الزبون": o.customerName || "زائر",
                "الحالة": o.status === 'pending' ? 'انتظار' : 'مكتمل',
                "وقت الحجز": new Date(o.createdAt).toLocaleString('ar-EG'),
                "آخر تحديث": new Date(o.updatedAt).toLocaleString('ar-EG'),
            }));
            setReportData(formattedReport);

        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            toast.error("فشل في تحديث البيانات");
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
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(() => {});
                sendNotification("طلب جديد! 🆕", {
                    body: `الزبون: ${newOrder.customerName} | رقم: ${newOrder.queueNumber}`,
                    icon: "/logo.png"
                });

                toast.success(`وصول طلب جديد رقم #${newOrder.queueNumber}`);
            });
        }

        return () => {
            if (socket) {
                socket.off('orderStatusChanged');
                socket.off('newOrder');
            }
        };
    }, [socket]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await api.patch(`/orders/${orderId}`, { status });
            toast.success("تم تحديث الحالة");
            fetchDashboardData();
        } catch (err) {
            toast.error("فشل التحديث");
        }
    };

    if (loading || !stats) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-800 pb-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">لوحة الإحصائيات 📊</h1>
                        <p className="text-slate-400 mt-1">مرحباً {user?.name}، إليك ملخص أداء النظام اليوم.</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <CSVLink 
                            data={reportData} 
                            filename={`SwiftQueue-Report-${new Date().toLocaleDateString()}.csv`}
                            uFEFF={true}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>تصدير تقرير CSV</span>
                        </CSVLink>

                        <button onClick={logout} className="bg-slate-800 hover:bg-red-900/40 hover:text-red-400 px-6 py-3 rounded-2xl font-bold transition-all border border-slate-700">
                            خروج
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                        <p className="text-slate-500 text-sm font-bold mb-1">إجمالي الحجوزات</p>
                        <h3 className="text-6xl font-black text-blue-500">{stats.totalOrders}</h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                        <p className="text-slate-500 text-sm font-bold mb-1">متوسط الانتظار</p>
                        <h3 className="text-6xl font-black text-emerald-500">{stats.avgWaitTime} <span className="text-xl">دقيقة</span></h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                        <p className="text-slate-500 text-sm font-bold mb-1">الطلبات النشطة</p>
                        <h3 className="text-6xl font-black text-amber-500">
                            {orders.filter(o => o.status === 'pending').length}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px]">
                        <div className="p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur-md">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                الطلبات الحية
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-800 scrollbar-hide">
                            {orders.length === 0 ? (
                                <div className="p-10 text-center text-slate-600">لا توجد طلبات حالياً</div>
                            ) : (
                                orders.map((order: any) => (
                                    <div key={order.id} className="p-6 hover:bg-slate-800/40 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">تذكرة #{order.queueNumber}</span>
                                                <h4 className="text-lg font-black text-white">{order.customerName}</h4>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            }`}>
                                                {order.status === 'pending' ? 'انتظار' : 'مكتمل'}
                                            </span>
                                        </div>
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                                            >
                                                تأشير كمكتمل ✅
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <StatsChart data={stats} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;