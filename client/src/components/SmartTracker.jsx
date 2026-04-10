import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // الاعتماد على HTTP-only Cookies

const SmartTracker = () => {
    const [order, setOrder] = useState(null);
    const [notify, setNotify] = useState(true);

    // دالة لتحديد تفاصيل الحالة ديناميكياً
    const getStatusUI = (status) => {
        const states = {
            'PENDING': { percent: 30, time: '15', label: 'Pending', color: 'bg-yellow-500' },
            'PREPARING': { percent: 65, time: '8', label: 'Preparing', color: 'bg-blue-500' },
            'READY': { percent: 100, time: '0', label: 'Ready', color: 'bg-green-500' }
        };
        return states[status] || states['PENDING'];
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get('/orders/my-orders');
                if (res.data.success && res.data.data.length > 0) {
                    setOrder(res.data.data[0]);
                }
            } catch (err) {
                console.error("Auth/Connection error", err.message);
            }
        };
        fetchOrder();
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!order) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    const ui = getStatusUI(order.status);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
            <div className="max-w-md mx-auto">
                {/* البطاقة الرئيسية مع التوهج الأزرق */}
                <div className="relative bg-[#0A0A0A] border border-blue-600/30 rounded-[2.5rem] p-12 text-center mb-8 shadow-[0_0_40px_-15px_rgba(37,99,235,0.4)] overflow-hidden">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Your Queue Number</p>
                    <h1 className="text-[130px] font-black leading-none mb-6 tracking-tighter text-white">
                        {order.queueNumber.toString().padStart(3, '0')}
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 px-5 py-1.5 rounded-full text-xs font-bold border border-blue-600/20">
                         <span className={`w-2 h-2 rounded-full ${ui.color} animate-pulse`}></span>
                         {ui.label}
                    </div>
                </div>

                {/* شريط التقدم (Order Progress) */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Order Progress</span>
                        <span className="text-blue-500 font-bold text-sm">{ui.percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-900 rounded-full">
                        <div 
                            className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)] transition-all duration-1000 ease-in-out"
                            style={{ width: `${ui.percent}%` }}
                        ></div>
                    </div>
                </div>

                {/* تفاصيل الوقت والتنبيهات */}
                <div className="space-y-4 mb-10">
                    <div className="bg-[#111] border border-gray-800 p-6 rounded-3xl flex items-center gap-5 transition hover:border-gray-700">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Estimated Wait Time</p>
                            <p className="text-xl font-black">~{ui.time} minutes</p>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-gray-800 p-6 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-blue-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                            </div>
                            <div>
                                <p className="font-bold">Notify Me</p>
                                <p className="text-gray-500 text-xs">Get notified when ready</p>
                            </div>
                        </div>
                        {/* Toggle Switch */}
                        <div 
                            onClick={() => setNotify(!notify)}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${notify ? 'bg-blue-600' : 'bg-gray-800'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${notify ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                </div>

                {/* سجل الطلبات (History) */}
                <div className="mt-8">
                    <h3 className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-6">Order History</h3>
                    <div className="space-y-4">
                        {[
                            { id: '042', time: 'Today, 2:30 PM', status: 'Completed', color: 'text-green-500' },
                            { id: '038', time: 'Yesterday, 1:15 PM', status: 'Completed', color: 'text-green-500' },
                            { id: '025', time: 'Apr 8, 11:00 AM', status: 'Cancelled', color: 'text-red-500' }
                        ].map((item, index) => (
                            <div key={index} className="bg-[#0A0A0A] border border-gray-900 p-5 rounded-[2rem] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5`}>
                                        {item.status === 'Completed' ? '✅' : '❌'}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">#{item.id}</p>
                                        <p className="text-gray-600 text-[10px]">{item.time}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/5 ${item.color}`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartTracker;