import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useSocket } from "../context/SocketContext";

const PublicDisplay = () => {
    const [readyOrders, setReadyOrders] = useState([]);
    const [processingOrders, setProcessingOrders] = useState([]);
    const socket = useSocket();

    const fetchData = async () => {
        try {
            const { data } = await api.get("/orders/public");
            setReadyOrders(data.filter((o) => o.status === "READY"));
            setProcessingOrders(data.filter((o) => o.status === "PREPARING"));
        } catch (err) {
            console.error("Error fetching display data", err);
        }
    };

    useEffect(() => {
        fetchData();
        if (socket) {
            socket.on("orderStatusChanged", () => { fetchData(); });
            socket.on("orderReady", (order) => {
                const msg = new SpeechSynthesisUtterance(`طلب رقم ${order.queueNumber} جاهز للاستلام`);
                msg.lang = "ar-SA";
                window.speechSynthesis.speak(msg);
            });
        }
        return () => {
            if (socket) {
                socket.off("orderStatusChanged");
                socket.off("orderReady");
            }
        };
    }, [socket]);

    return (
        <div className="h-screen bg-slate-900 text-white p-10 flex flex-col font-sans" dir="rtl">
            <header className="text-center mb-10">
                <h1 className="text-6xl font-black text-blue-500 tracking-tighter">SwiftQueue</h1>
                <p className="text-2xl text-slate-400 mt-2">حالة الطلبات المباشرة</p>
            </header>
            <div className="grid grid-cols-2 gap-10 flex-1">
                <div className="bg-emerald-900/20 border-4 border-emerald-500 rounded-3xl p-10 text-center">
                    <h2 className="text-4xl font-bold text-emerald-400 mb-12">جاهز للاستلام ✅</h2>
                    <div className="grid grid-cols-2 gap-8">
                        {readyOrders.map(order => (
                            <div key={order.id} className="text-9xl font-black animate-pulse text-white">
                                {order.queueNumber}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-blue-900/10 border-4 border-blue-500/30 rounded-3xl p-10 text-center">
                    <h2 className="text-4xl font-bold text-blue-400 mb-12">قيد التحضير ⏳</h2>
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