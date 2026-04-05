import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig'; 
import toast from 'react-hot-toast';
import StatsChart from '../components/StatsChart';
import { useSocket } from '../context/SocketContext';
import { requestNotificationPermission, sendNotification } from '../utils/notifications';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const socket = useSocket();

    const fetchData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/orders/admin/stats'),
                api.get('/orders/my-orders')
            ]);
            setStats(statsRes.data);
            setOrders(ordersRes.data.data || ordersRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data", err);
            toast.error("فشل في جلب البيانات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        requestNotificationPermission();

        if (socket) {
            socket.on('orderStatusChanged', fetchData);
            
            socket.on('newOrder', (newOrder) => {
                fetchData(); 
                
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(() => {});
                
                sendNotification("طلب جديد قد وصل! 🔔", {
                    body: `الزبون: ${newOrder.customerName || 'زائر'} | رقم الدور: ${newOrder.queueNumber}`,
                    icon: "/logo.png"
                });
                
                toast('طلب جديد قد وصل! 🔔', { icon: '🛒' });
            });
        }

        return () => {
            if (socket) {
                socket.off('orderStatusChanged');
                socket.off('newOrder');
            }
        };
    }, [socket]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}`, { status: newStatus });
            toast.success('تم التحديث بنجاح!');
            fetchData(); 
        } catch (error) {
            toast.error("عذراً، فشل التحديث");
        }
    };

    if (loading || !stats) return <div className="flex justify-center items-center h-screen font-bold text-blue-600">جاري التحميل...</div>;

    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white font-sans" dir="rtl">
            <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white">أهلاً بك، {user?.name} 👋</h1>
                    <p className="text-slate-400">لوحة تحكم النظام المباشرة</p>
                </div>
                <button onClick={logout} className="bg-red-500/10 text-red-500 px-6 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">
                    تسجيل الخروج
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-[2rem] text-center">
                    <p className="text-slate-400 text-sm mb-2">إجمالي الطلبات</p>
                    <h2 className="text-5xl font-black text-blue-400">{stats.totalOrders}</h2>
                </div>
                <div className="bg-emerald-600/10 border border-emerald-500/30 p-8 rounded-[2rem] text-center">
                    <p className="text-slate-400 text-sm mb-2">متوسط الانتظار</p>
                    <h2 className="text-5xl font-black text-emerald-400">{stats.avgWaitTime} <span className="text-lg">دقيقة</span></h2>
                </div>
                <div className="bg-amber-600/10 border border-amber-500/30 p-8 rounded-[2rem] text-center">
                    <p className="text-slate-400 text-sm mb-2">في الانتظار حالياً</p>
                    <h2 className="text-5xl font-black text-amber-400">{orders.filter(o => o.status === 'pending').length}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 rounded-[2rem] border border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-700 font-bold">الطلبات الحالية</div>
                    <div className="divide-y divide-slate-700 max-h-[500px] overflow-y-auto">
                        {orders.length === 0 ? (
                            <div className="p-10 text-center text-slate-500">لا يوجد طلبات حالياً</div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="p-6 flex justify-between items-center hover:bg-slate-700/30">
                                    <div>
                                        <p className="font-bold text-lg text-white">#{order.queueNumber} - {order.customerName}</p>
                                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString('ar-EG')}</p>
                                    </div>
                                    {order.status === 'pending' && (
                                        <button onClick={() => updateStatus(order.id, 'completed')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">إكمال</button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <StatsChart data={stats} />
            </div>
        </div>
    );
};

export default Dashboard;