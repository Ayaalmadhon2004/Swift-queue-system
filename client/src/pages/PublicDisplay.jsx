import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";
import { useSocket } from "../context/SocketContext";

const PublicDisplay = () => {
    const [readyOrders, setReadyOrders] = useState([]);
    const [processingOrders, setProcessingOrders] = useState([]);
    const socket = useSocket();

    const fetchData = useCallback(async () => {
        try {
            const { data } = await api.get("/orders/public");
            setReadyOrders(data.filter((o) => o.status === "READY"));
            setProcessingOrders(data.filter((o) => o.status === "PREPARING"));
        } catch (err) {
            console.error("Error fetching display data", err);
        }
    }, []);

    const speakOrder = (queueNumber) => {
        const msg = new SpeechSynthesisUtterance(`طلب رقم ${queueNumber} جاهز للاستلام`);
        msg.lang = "ar-SA";
        window.speechSynthesis.speak(msg);
    };

    useEffect(() => {
        fetchData();

        if (socket) {
            // 1. استقبال الطلبات الجديدة دفعة واحدة عند المزامنة
            socket.on("ordersSynced", (newOrders) => {
                setProcessingOrders(prev => [...newOrders, ...prev]);
            });

            // 2. تحديث الحالة برمجياً دون إعادة جلب (Optimization)
            socket.on("orderStatusChanged", ({ orderId, newStatus }) => {
                if (newStatus === "READY") {
                    setProcessingOrders(prev => {
                        const order = prev.find(o => o.id === orderId);
                        if (order) {
                            setReadyOrders(current => [order, ...current]);
                            speakOrder(order.queueNumber); // نطق الرقم فوراً
                        }
                        return prev.filter(o => o.id !== orderId);
                    });
                } else if (newStatus === "COMPLETED") {
                    setReadyOrders(prev => prev.filter(o => o.id !== orderId));
                }
            });
        }

        return () => {
            if (socket) {
                socket.off("ordersSynced");
                socket.off("orderStatusChanged");
            }
        };
    }, [socket, fetchData]);

    return (
        <div className="h-screen bg-slate-900 text-white p-10 flex flex-col font-sans" dir="rtl">
            <header className="text-center mb-10">
                <h1 className="text-6xl font-black text-blue-500 tracking-tighter">SwiftQueue</h1>
                <p className="text-2xl text-slate-400 mt-2">حالة الطلبات المباشرة</p>
            </header>

            <div className="grid grid-cols-2 gap-10 flex-1">
                {/* قسم الجاهز - استخدام ألوان زاهية و Pulse لإثارة الانتباه */}
                <div className="bg-emerald-900/20 border-4 border-emerald-500 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <h2 className="text-4xl font-bold text-emerald-400 mb-12 border-b border-emerald-500/20 pb-4">جاهز للاستلام ✅</h2>
                    <div className="grid grid-cols-2 gap-8">
                        {readyOrders.map(order => (
                            <div key={order.id} className="text-9xl font-black animate-pulse text-white drop-shadow-2xl">
                                {order.queueNumber}
                            </div>
                        ))}
                    </div>
                </div>

                {/* قسم التحضير - ألوان هادئة */}
                <div className="bg-blue-900/10 border-4 border-blue-500/30 rounded-3xl p-10 text-center">
                    <h2 className="text-4xl font-bold text-blue-400 mb-12 border-b border-blue-500/20 pb-4">قيد التحضير ⏳</h2>
                    <div className="grid grid-cols-3 gap-6">
                        {processingOrders.map(order => (
                            <div key={order.id} className="text-5xl font-bold text-slate-500">
                                {order.queueNumber}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicDisplay;