import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import { sendNotification as sendLocalNotification, requestNotificationPermission } from '../utils/notifications';
import api from "../api/axiosConfig";
import ReportSkeleton from "../components/ReportSkeleton";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [waitTime, setWaitTime] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const socket = useSocket();

    const fetchMyOrders = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/orders/my-orders");
            const actualOrders = data.data || [];
            setOrders(actualOrders);
            // ضبط الوقت المتوقع من البيانات القادمة من السيرفر
            const estimated = data.estimatedWaitTime || 0;
            setWaitTime(estimated);
            setTimeLeft(estimated);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleStatusChange = useCallback((data) => {
        const { orderId, newStatus, queueNumber } = data;
        
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
            audio.play().catch(() => console.log("Audio blocked"));
            
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        }
    }, []);

    // مؤقت العد التنازلي
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 60000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // الإعداد الأولي والاشتراك في السوكت
    useEffect(() => {
        fetchMyOrders();
        requestNotificationPermission();

        if (socket) {
            socket.on('orderStatusChanged', handleStatusChange);
            socket.on('status_updated', handleStatusChange);
        }

        return () => {
            if (socket) {
                socket.off('orderStatusChanged', handleStatusChange);
                socket.off('status_updated', handleStatusChange);
            }
        };
    }, [socket, handleStatusChange, fetchMyOrders]);

    if (loading) return <ReportSkeleton />;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 font-sans" dir="rtl">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-black text-blue-500">طلباتي النشطة</h1>
                <p className="text-slate-400 mt-2">تابع حالة طلبك لحظة بلحظة</p>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-dashed border-slate-700">
                        <p className="text-slate-500 text-xl">ليس لديك طلبات نشطة حالياً</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl transition-all hover:border-blue-500/50">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-slate-400 text-sm block mb-1">رقم الدور</span>
                                    <span className="text-5xl font-black text-white">{order.queueNumber}</span>
                                </div>
                                {order.status === 'PREPARING' && (
                                    <div className="text-left">
                                        <span className="text-blue-400 text-xs font-bold block">الوقت المتوقع</span>
                                        <span className="text-xl font-bold text-white">~{timeLeft} دقيقة</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-300 text-sm">الحالة:</span>
                                <div className={`px-4 py-1 rounded-full text-xs font-bold ${
                                    order.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400' : 
                                    order.status === 'PREPARING' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                                }`}>
                                    {order.status === 'READY' ? 'جاهز للاستلام' : 'جاري التحضير'}
                                </div>
                            </div>

                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${
                                        order.status === 'READY' ? 'w-full bg-emerald-500' : 'w-1/2 bg-blue-500'
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