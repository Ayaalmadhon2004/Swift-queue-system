import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig'; 
import toast from 'react-hot-toast';
import StatsChart from '../components/StatsChart';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const socket = useSocket();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/orders/admin/stats'),
                api.get('/orders/my-orders')
            ]);

            // الوصول الآمن للبيانات لتجنب خطأ 500 في الواجهة
            setStats(statsRes.data.data || statsRes.data);
            const ordersData = ordersRes.data.data || ordersRes.data;
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            toast.error("فشل في جلب بعض البيانات، تأكد من صلاحيات الأدمن");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        if (socket) {
            socket.on('ordersSynced', (syncedOrders) => {
                setOrders(prev => {
                    const existingIds = new Set(prev.map(o => o.id));
                    const newOnes = syncedOrders.filter(o => !existingIds.has(o.id));
                    return [...newOnes, ...prev];
                });
                toast.success(`تمت مزامنة ${syncedOrders.length} طلبات جديدة`);
            });

            socket.on('orderStatusChanged', ({ orderId, newStatus }) => {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            });
        }
        return () => {
            socket?.off('ordersSynced');
            socket?.off('orderStatusChanged');
        };
    }, [socket, fetchData]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            // تحديث متفائل (Optimistic)
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            toast.success('تم التحديث بنجاح');
        } catch (error) {
            toast.error("فشل التحديث");
            fetchData(); // تراجع للحالة الأصلية
        }
    };

    if (loading || !stats) return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-blue-500 font-bold">جاري تهيئة لوحة التحكم...</p>
        </div>
    );

    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white" dir="rtl">
            <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white">لوحة الإدارة 👋</h1>
                    <p className="text-slate-400">مرحباً {user?.name}، إليك إحصائيات اليوم</p>
                </div>
                <button onClick={logout} className="bg-red-500/10 text-red-500 px-6 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    خروج
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title="إجمالي الطلبات" value={stats.totalOrders} color="blue" />
                <StatCard title="متوسط الانتظار" value={`${stats.avgWaitTime} د`} color="emerald" />
                <StatCard title="قيد التحضير" value={orders.filter(o => o.status === 'PREPARING').length} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-700 font-bold">الطلبات الحالية</div>
                    <div className="divide-y divide-slate-700 max-h-[500px] overflow-y-auto">
                        {orders.map(order => (
                            <div key={order.id} className="p-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors">
                                <div>
                                    <p className="font-bold">#{order.queueNumber} - {order.customerName}</p>
                                    <span className="text-xs text-slate-400">{order.status}</span>
                                </div>
                                <div className="flex gap-2">
                                    {order.status === 'PREPARING' && (
                                        <button onClick={() => updateStatus(order.id, 'READY')} className="bg-emerald-600 text-xs px-3 py-1 rounded-lg">جاهز</button>
                                    )}
                                    {order.status === 'READY' && (
                                        <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="bg-blue-600 text-xs px-3 py-1 rounded-lg">تسليم</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-3xl border border-slate-700 p-6">
                    <StatsChart data={stats} />
                </div>
            </div>
        </div>
    );
};

// مكون صغير للكروت لتقليل تكرار الكود
const StatCard = ({ title, value, color }) => (
    <div className={`bg-${color}-600/10 border border-${color}-500/30 p-6 rounded-3xl text-center`}>
        <p className="text-slate-400 text-sm mb-1">{title}</p>
        <h2 className={`text-4xl font-black text-${color}-400`}>{value}</h2>
    </div>
);

export default Dashboard;