import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; 

const SmartTracker = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getStatusUI = (status) => {
        const states = {
            'PENDING': { percent: 30, time: '15', label: 'في الانتظار', color: 'bg-yellow-500' },
            'PREPARING': { percent: 65, time: '8', label: 'يتم التجهيز', color: 'bg-blue-500' },
            'READY': { percent: 100, time: '0', label: 'جاهز للاستلام', color: 'bg-green-500' },
            'COMPLETED': { percent: 100, time: '0', label: 'تم التسليم', color: 'bg-gray-500' }
        };
        return states[status] || states['PENDING'];
    };

    const fetchLatestOrder = async () => {
    try {
        // إضافة Query String عشوائي يمنع الـ Caching
        const res = await api.get(`/orders/my-orders?nocache=${Date.now()}`);
        console.log("Tracker Sync:", res.data); 

        if (res.data.success && res.data.data.length > 0) {
            setOrder(res.data.data[0]); 
            setError(null);
        } else {
            setOrder(null);
        }
    } catch (err) {
        setError("فشل في تحديث الحالة.");
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchLatestOrder();
        // Polling كل 7 ثوانٍ لضمان المزامنة
        const interval = setInterval(fetchLatestOrder, 7000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">جاري تحديث الطلب...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-blue-500/10 p-6 rounded-full mb-6">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">لا يوجد طلبات نشطة</h2>
                <p className="text-gray-500 mb-8">لم نجد طلبات مرتبطة بك حالياً.</p>
                <button onClick={() => window.location.href = '/'} className="bg-blue-600 px-8 py-3 rounded-2xl font-bold">احجز الآن</button>
            </div>
        );
    }

    const ui = getStatusUI(order.status);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6">
            <div className="max-w-md mx-auto">
                <div className="bg-[#0A0A0A] border border-blue-600/30 rounded-[2.5rem] p-12 text-center mb-8 shadow-2xl">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-4">رقمك الحالي</p>
                    <h1 className="text-[120px] font-black leading-none mb-6">
                        {order.queueNumber.toString().padStart(3, '0')}
                    </h1>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${ui.color}/20 text-white border border-${ui.color}`}>
                         <span className={`w-2 h-2 rounded-full ${ui.color} animate-pulse`}></span>
                         {ui.label}
                    </div>
                </div>

                <div className="mb-10">
                    <div className="flex justify-between mb-2 text-xs font-bold text-gray-500">
                        <span>التقدم</span>
                        <span>{ui.percent}%</span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${ui.percent}%` }}></div>
                    </div>
                </div>

                <div className="bg-[#111] p-6 rounded-3xl flex items-center gap-4">
                    <div className="text-2xl">⏳</div>
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase">انتظار تقريبي</p>
                        <p className="text-xl font-bold">{ui.time} دقيقة</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartTracker;