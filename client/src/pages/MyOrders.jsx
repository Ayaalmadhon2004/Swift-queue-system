import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../context/SocketContext";
import { sendNotification as sendLocalNotification, requestNotificationPermission } from '../utils/notifications';
import api from "../api/axiosConfig";
import ReportSkeleton from "../components/ReportSkeleton";

const MyOrders = () => {
    const queryClient = useQueryClient();
    const socket = useSocket();

    const { data, isLoading } = useQuery({
        queryKey: ['myOrders'],
        queryFn: async () => {
            const { data } = await api.get("/orders/my-orders");
            return data;
        }
    });

    const orders = data?.data || [];
    const timeLeft = data?.estimatedWaitTime || 0;

    useEffect(() => {
        requestNotificationPermission();
        if (socket) {
            const handleUpdate = (payload) => {
                queryClient.invalidateQueries(['myOrders']);
                if (payload.newStatus === 'READY') {
                    sendLocalNotification(`Your order is ready! ✅`, {
                        body: `Queue Number: ${payload.queueNumber}`,
                        icon: '/logo.png'
                    });
                    new Audio('/sounds/notification.mp3').play().catch(() => {});
                    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
                }
            };

            socket.on('orderStatusChanged', handleUpdate);
            socket.on('status_updated', handleUpdate);

            return () => {
                socket.off('orderStatusChanged', handleUpdate);
                socket.off('status_updated', handleUpdate);
            };
        }
    }, [socket, queryClient]);

    if (isLoading) return <ReportSkeleton />;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-black text-blue-500">My Active Orders</h1>
                <p className="text-slate-400 mt-2">Track your status in real-time</p>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-dashed border-slate-700">
                        <p className="text-slate-500 text-xl">You have no active orders currently</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl transition-all hover:border-blue-500/50">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-slate-400 text-sm block mb-1">Queue Number</span>
                                    <span className="text-5xl font-black text-white">{order.queueNumber}</span>
                                </div>
                                {order.status === 'PREPARING' && (
                                    <div className="text-right">
                                        <span className="text-blue-400 text-xs font-bold block">Est. Wait Time</span>
                                        <span className="text-xl font-bold text-white">~{timeLeft} mins</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-300 text-sm">Status:</span>
                                <div className={`px-4 py-1 rounded-full text-xs font-bold ${
                                    order.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {order.status === 'READY' ? 'READY FOR PICKUP' : 'PREPARING'}
                                </div>
                            </div>
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${order.status === 'READY' ? 'w-full bg-emerald-500' : 'w-1/2 bg-blue-500'}`}></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;