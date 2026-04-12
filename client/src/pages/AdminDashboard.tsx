import React, { useEffect, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axiosConfig'; 
import toast from 'react-hot-toast';
import { CSVLink } from "react-csv";
import StatsChart from '../components/StatsChart';
import { requestNotificationPermission, sendNotification } from '../utils/notifications';

const AdminDashboard = () => {
    const { logout } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const socket = useSocket();

    // 1. Fetch Stats & Orders using TanStack Query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await api.get('/orders/admin/stats');
            return res.data;
        },
        onError: (err) => {
            if (err.response?.status === 401) logout();
        }
    });

    const { data: orders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await api.get('/orders/my-orders');
            return res.data.data || res.data;
        }
    });

    // 2. Mutation for updating status
    const statusMutation = useMutation({
        mutationFn: ({ orderId, status }) => api.patch(`/orders/${orderId}`, { status }),
        onSuccess: () => {
            toast.success("Status updated successfully");
            queryClient.invalidateQueries(['orders', 'adminStats']);
        },
        onError: () => toast.error("Update failed")
    });

    // 3. Memoize report data to avoid recalculating on every render
    const reportData = useMemo(() => {
        return orders.map((o) => ({
            "Queue Number": o.queueNumber,
            "Customer Name": o.customerName || "Guest",
            "Status": o.status === 'pending' ? 'Waiting' : 'Completed',
            "Booking Time": new Date(o.createdAt).toLocaleString('en-US'),
        }));
    }, [orders]);

    // 4. Socket Events integration
    useEffect(() => {
        requestNotificationPermission();

        if (socket) {
            const handleUpdate = () => queryClient.invalidateQueries(['orders', 'adminStats']);
            
            socket.on('orderStatusChanged', handleUpdate);
            socket.on('newOrder', (newOrder) => {
                handleUpdate();
                new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
                sendNotification("New Order! 🆕", {
                    body: `Customer: ${newOrder.customerName} | #: ${newOrder.queueNumber}`,
                });
                toast.success(`New order received #${newOrder.queueNumber}`);
            });

            return () => {
                socket.off('orderStatusChanged', handleUpdate);
                socket.off('newOrder');
            };
        }
    }, [socket, queryClient]);

    if (statsLoading || ordersLoading) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
                <p className="text-slate-500 animate-pulse">Initializing Dashboard Terminal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-10">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">Control Panel 🛠️</h1>
                        <p className="text-slate-400 mt-3 text-lg">Welcome to Gaza Pulse. You are currently managing the live queue.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <CSVLink 
                            data={reportData} 
                            filename={`GazaPulse-Report-${new Date().toISOString().split('T')[0]}.csv`}
                            uFEFF={true}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-3"
                        >
                            <span>Export Reports</span>
                        </CSVLink>
                        <button onClick={logout} className="bg-slate-900/50 hover:bg-red-950/30 px-8 py-3.5 rounded-2xl font-bold border border-slate-800 text-slate-400">
                            Logout
                        </button>
                    </div>
                </header>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <StatCard title="Total Orders" value={stats?.totalOrders} color="blue" />
                    <StatCard title="Avg Wait" value={`${stats?.avgWaitTime}m`} color="emerald" />
                    <StatCard title="In Queue" value={orders.filter(o => o.status === 'pending').length} color="amber" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-5 bg-[#0A0A0A] border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col h-[700px]">
                        <div className="p-8 border-b border-slate-800 bg-slate-900/20 sticky top-0 z-10">
                            <h2 className="text-2xl font-black flex items-center gap-4 uppercase tracking-tighter">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                                Active Orders
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {orders.filter(o => o.status === 'pending').map((order) => (
                                <div key={order.id} className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">#{order.queueNumber}</span>
                                            <h4 className="text-xl font-black text-white mt-2">{order.customerName || "Anonymous User"}</h4>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => statusMutation.mutate({ orderId: order.id, status: 'completed' })}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm transition-all active:scale-95"
                                    >
                                        Complete Service ✅
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-[#0A0A0A] border border-slate-800 rounded-[3rem] p-10">
                        <h2 className="text-2xl font-black mb-10">Performance Analytics 📈</h2>
                        <div className="h-[500px] w-full">
                            <StatsChart data={stats} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] relative overflow-hidden group">
        <p className="text-slate-500 text-sm font-bold mb-2 uppercase tracking-widest">{title}</p>
        <h3 className={`text-7xl font-black text-${color}-500 tracking-tighter`}>{value}</h3>
    </div>
);

export default AdminDashboard;