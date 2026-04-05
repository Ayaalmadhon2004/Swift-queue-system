import React, { useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig'; 
import toast from 'react-hot-toast';
import StatsChart from './StatsChart';
import { useSocket } from '../context/SocketContext';

// why i am using socket in every page ??? tell me 
const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const socket=useSocket();

    const fetchStats=async()=>{
        try{
            const {data} = await api.get('/orders/admin/stats');
            setStats(data);
        } catch(err) {console.error(err);
        }
    }

    useEffect(()=>{
        fetchStats();

        if(socket){
           socket.on('orderStatusChanged', fetchStats);
            socket.on('newOrder', fetchStats);
        }
        
        return () => {
            if (socket) {
                socket.off('orderStatusChanged');
                socket.off('newOrder');
            }
        };
    }, [socket]);

    if (!stats) return <div className="p-10 text-white">جاري تحليل البيانات...</div>;
    
    }

    useEffect(() => {
        api.get('/orders/admin/stats').then(res => setStats(res.data));
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/my-orders');
                setOrders(data.data || data); 
            } catch (err) {
                toast.error("فشل في جلب الطلبات");
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        const socket = io('http://localhost:3000', {
            auth: { token: localStorage.getItem('token') }
        });

        socket.on('status_updated', (update) => {
            setOrders(prev => prev.map(order => 
                order.id === update.orderId ? { ...order, status: update.newStatus } : order
            ));
            toast.success(`الطلب #${update.orderId.slice(-4)} أصبح ${update.newStatus}`);
        });

        socket.on('newOrder', (newOrder) => {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log("Audio play blocked by browser interaction"));
            
            setOrders((prev) => [newOrder, ...prev]);
            toast('طلب جديد قد وصل! 🔔', { icon: '🛒' });
        });

        return () => {socket.disconnect()}; 
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}`, { status: newStatus });
            toast.success('تم التحديث بنجاح!');
        } catch (error) {
            toast.error("عذراً، فشل التحديث");
            console.error(error);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen font-bold text-blue-600">جاري التحميل...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">أهلاً بك، {user?.name} 👋</h1>
                        <p className="text-gray-500 text-sm">لوحة تحكم الطلبات المباشرة</p>
                    </div>
                    <button 
                        onClick={logout} 
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors"
                    >
                        تسجيل الخروج
                    </button>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 font-bold text-gray-700 bg-gray-50/50">
                        الطلبات الحالية ({orders.length})
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <div className="p-10 text-center text-gray-400">لا يوجد طلبات حالياً</div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="p-6 flex flex-wrap justify-between items-center hover:bg-gray-50 transition-colors">
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 text-lg">طلب #{order.id.slice(-6)}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleString('ar-EG')}
                                        </p>
                                        <p className="text-sm font-medium text-blue-600">العميل: {order.customerName || 'زائر'}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                            order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {order.status === 'pending' ? 'انتظار' : order.status === 'completed' ? 'مكتمل' : order.status}
                                        </span>
                                        
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={() => updateStatus(order.id, 'completed')}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                                            >
                                                إكمال الطلب
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {stats && <StatsChart data={stats} />}
                </div>
            </div>
        </div>
    );
    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white font-sans" dir="rtl">
            <h1 className="text-3xl font-black mb-10 border-b border-slate-800 pb-4">لوحة تحكم المدير 📊</h1>

            {/* بطاقات الإحصائيات السريعة */}
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
                    <p className="text-slate-400 text-sm mb-2">الطلبات النشطة</p>
                    <h2 className="text-5xl font-black text-amber-400">
                        {stats.statusDistribution.find((s:any) => s.status === 'PREPARING')?._count.id || 0}
                    </h2>
                </div>
            </div>

            {/* المكون الذي أنشأناه سابقاً للرسوم البيانية */}
            <StatsChart data={stats} />
        </div>
    );
};

export default Dashboard;