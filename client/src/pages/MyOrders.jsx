import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import { sendNotification as sendLocalNotification, requestNotificationPermission } from '../utils/notifications';
import api from "../api/axiosConfig";

const MyOrders = () => {
    const [orders, setOrders] = useState([]); // الحالة الابتدائية مصفوفة فارغة لضمان عمل map
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    const fetchMyOrders = useCallback(async () => {
        try {
            const { data } = await api.get("/orders/my-orders");
            // الإصلاح الجوهري: استخراج المصفوفة من داخل كائن الرد (response.data.data)
            const actualOrders = data.data || []; 
            setOrders(actualOrders);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setOrders([]); // ضمان عدم تعطل التطبيق عند الخطأ
        } finally {
            setLoading(false);
        }
    }, []);

    const handleStatusChange = useCallback(({ orderId, newStatus, queueNumber }) => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );

        if (newStatus === 'READY') {
            sendLocalNotification(`طلبك جاهز للاستلام! ✅`, {
                body: `رقم الدور الخاص بك هو: ${queueNumber}`,
                icon: '/logo.png' 
            });
            
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(() => console.log("Audio play blocked until user interaction"));
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        }
    }, []);

    useEffect(() => {
        fetchMyOrders();
        requestNotificationPermission();

        if (socket) {
            socket.on('orderStatusChanged', handleStatusChange);
        }

        return () => {
            if (socket) {
                socket.off('orderStatusChanged', handleStatusChange);
            }
        };
    }, [socket, handleStatusChange, fetchMyOrders]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-blue-500 animate-bounce font-black text-xl">جاري تحميل طلباتك...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 font-sans" dir="rtl">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-black text-blue-500">طلباتي النشطة</h1>
                <p className="text-slate-400 mt-2">تابع حالة طلبك لحظة بلحظة</p>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* استخدام Array.isArray للتأكد من نوع البيانات قبل الرندر */}
                {Array.isArray(orders) && orders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-dashed border-slate-700">
                        <p className="text-slate-500 text-xl">ليس لديك طلبات نشطة حالياً</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl transition-all hover:border-blue-500/50">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <span className="text-slate-400 text-sm block mb-1">رقم الدور</span>
                                    <span className="text-5xl font-black text-white">{order.queueNumber}</span>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl text-sm font-bold ${
                                    order.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400' : 
                                    order.status === 'PREPARING' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                                }`}>
                                    {order.status === 'READY' ? 'جاهز للاستلام' : 
                                     order.status === 'PREPARING' ? 'جاري التحضير' : 'في الانتظار'}
                                </div>
                            </div>
                            
                            {/* شريط التقدم التفاعلي بناءً على الحالة */}
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${
                                        order.status === 'READY' ? 'w-full bg-emerald-500' : 
                                        order.status === 'PREPARING' ? 'w-1/2 bg-blue-500' : 'w-1/6 bg-slate-500'
                                    }`}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;