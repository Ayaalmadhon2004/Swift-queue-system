import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import { useSocket } from "../context/SocketContext";

const PublicDisplay = () => {
    const queryClient = useQueryClient();
    const socket = useSocket();

    const { data: orders = [] } = useQuery({
        queryKey: ['publicOrders'],
        queryFn: async () => {
            const { data } = await api.get("/orders/public");
            return data;
        },
        refetchInterval: 60000 
    });

    const readyOrders = orders.filter((o) => o.status === "READY");
    const processingOrders = orders.filter((o) => o.status === "PREPARING");

    useEffect(() => {
        if (socket) {
            const handleSync = () => queryClient.invalidateQueries(['publicOrders']);
            
            socket.on("ordersSynced", handleSync);
            socket.on("orderStatusChanged", ({ newStatus, queueNumber }) => {
                handleSync();
                if (newStatus === "READY") {
                    // Voice notification in English
                    const msg = new SpeechSynthesisUtterance(`Order number ${queueNumber} is ready for collection`);
                    msg.lang = "en-US";
                    window.speechSynthesis.speak(msg);
                }
            });

            return () => {
                socket.off("ordersSynced");
                socket.off("orderStatusChanged");
            };
        }
    }, [socket, queryClient]);

    return (
        <div className="h-screen bg-slate-900 text-white p-10 flex flex-col font-sans">
            <header className="text-center mb-10">
                <h1 className="text-6xl font-black text-blue-500 tracking-tighter">SwiftQueue</h1>
                <p className="text-2xl text-slate-400 mt-2">Live Order Status</p>
            </header>

            <div className="grid grid-cols-2 gap-10 flex-1">
                <div className="bg-emerald-900/20 border-4 border-emerald-500 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <h2 className="text-4xl font-bold text-emerald-400 mb-12 border-b border-emerald-500/20 pb-4">READY FOR PICKUP ✅</h2>
                    <div className="grid grid-cols-2 gap-8">
                        {readyOrders.map(order => (
                            <div key={order.id} className="text-9xl font-black animate-pulse text-white">{order.queueNumber}</div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-900/10 border-4 border-blue-500/30 rounded-3xl p-10 text-center">
                    <h2 className="text-4xl font-bold text-blue-400 mb-12 border-b border-blue-500/20 pb-4">PREPARING ⏳</h2>
                    <div className="grid grid-cols-3 gap-6">
                        {processingOrders.map(order => (
                            <div key={order.id} className="text-5xl font-bold text-slate-500">{order.queueNumber}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicDisplay;