import React, { useEffect, useState, useContext, useCallback } from 'react';
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

    // استخدام useCallback لمنع إعادة تعريف الدالة في كل ريندر
    const fetchData = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchData();
        requestNotificationPermission();

        if (socket) {
            // استقبال حدث المزامنة المجمع (الذي أضفناه في السيرفر)
            socket.on('ordersSynced', (syncedOrders) => {
                setOrders(prev => {
                    const existingIds = new Set(prev.map(o => o.id));
                    const newUniqueOrders = syncedOrders.filter(o => !existingIds.has(o.id));
                    return [...newUniqueOrders, ...prev];
                });
                
                // تنبيه صوتي وإشعار للمجموعة الجديدة
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(() => {});
                
                toast.success(`${syncedOrders.length} طلبات جديدة تمت مزامنتها!`);
            });

            // تحديث حالة طلب معين دون إعادة جلب القائمة كاملة
            socket.on('orderStatusChanged', ({ orderId, newStatus }) => {
                setOrders(prev => prev.map(order => 
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            });
        }

        return () => {
            if (socket) {
                socket.off('ordersSynced');
                socket.off('orderStatusChanged');
            }
        };
    }, [socket, fetchData]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            // تحديث متفائل (Optimistic Update) للواجهة قبل رد السيرفر
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            
            await api.patch(`/orders/${orderId}`, { status: newStatus });
            toast.success('تم التحديث!');
        } catch (error) {
            toast.error("فشل التحديث، جاري إعادة جلب البيانات");
            fetchData(); // تراجع للحالة الصحيحة في حال الفشل
        }
    };

    if (loading || !stats) return (
        <div className="flex justify-center items-center h-screen bg-slate-900 text-blue-500 font-bold">
            جاري تهيئة لوحة التحكم...
        </div>
    );

    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white font-sans" dir="rtl">
            {/* Header Section */}
            <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black">أهلاً بك، {user?.name} 👋</h1>
                    <p className="text-slate-400">نظام المزامنة الذكي يعمل الآن بنجاح</p>
                </div>
                <button onClick={logout} className="bg-red-500/10 text-red-500 px-6 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">
                    تسجيل الخروج
                </button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-[2rem] text-center transition-transform hover:scale-105">
                    <p className="text-slate-400 text-sm mb-2">إجمالي الطلبات</p>
                    <h2 className="text-5xl font-black text-blue-400">{stats.totalOrders}</h2>
                </div>
                <div className="bg-emerald-600/10 border border-emerald-500/30 p-8 rounded-[2rem] text-center transition-transform hover:scale-105">
                    <p className="text-slate-400 text-sm mb-2">متوسط الانتظار</p>
                    <h2 className="text-5xl font-black text-emerald-400">{stats.avgWaitTime} <span className="text-lg">دقيقة</span></h2>
                </div>
                <div className="bg-amber-600/10 border border-amber-500/30 p-8 rounded-[2rem] text-center transition-transform hover:scale-105">
                    <p className="text-slate-400 text-sm mb-2">في التحضير (PREPARING)</p>
                    <h2 className="text-5xl font-black text-amber-400">{orders.filter(o => o.status === 'PREPARING').length}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders List */}
                <div className="bg-slate-800/50 rounded-[2rem] border border-slate-700 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-700 font-bold bg-slate-800">قائمة الطلبات الحية</div>
                    <div className="divide-y divide-slate-700 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {orders.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 italic">لا يوجد طلبات في الطابور حالياً</div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="p-6 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
                                    <div>
                                        <p className="font-bold text-lg text-white">#{order.queueNumber} - {order.customerName}</p>
                                        <span className={`text-[10px] px-2 py-1 rounded-full ${order.status === 'READY' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {order.status === 'PREPARING' && (
                                            <button onClick={() => updateStatus(order.id, 'READY')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all">جاهز</button>
                                        )}
                                        {order.status === 'READY' && (
                                            <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all">تم التسليم</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-slate-800/50 rounded-[2rem] border border-slate-700 p-6 shadow-2xl">
                    <StatsChart data={stats} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;