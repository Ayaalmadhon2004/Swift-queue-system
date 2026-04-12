import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axiosConfig'; 
import toast from 'react-hot-toast';
import { CSVLink } from "react-csv";
import StatsChart from '../components/StatsChart';
import { requestNotificationPermission, sendNotification } from '../utils/notifications';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const socket = useSocket();

    const fetchDashboardData = useCallback(async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/orders/admin/stats'),
                api.get('/orders/my-orders') 
            ]);

            const statsData = statsRes.data.data || statsRes.data;
            const allOrders = ordersRes.data.data || ordersRes.data;
            
            setStats(statsData);
            setOrders(Array.isArray(allOrders) ? allOrders : []);

            const formattedReport = allOrders.map((o) => ({
                "Ticket #": o.queueNumber,
                "Customer": o.customerName || "Guest",
                "Status": o.status,
                "Timestamp": new Date(o.createdAt).toLocaleString('en-US'),
            }));
            setReportData(formattedReport);

        } catch (err) {
            console.error("Fetch Error:", err);
            if (err.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        fetchDashboardData();
        requestNotificationPermission();

        if (socket) {
            socket.on('orderStatusChanged', fetchDashboardData);
            socket.on('newOrder', (newOrder) => {
                fetchDashboardData();
                new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
                sendNotification("New Ticket Alert! 🆕", {
                    body: `Customer: ${newOrder.customerName} | Ticket: ${newOrder.queueNumber}`,
                });
                toast.success(`New Ticket #${newOrder.queueNumber}`);
            });
        }

        return () => {
            socket?.off('orderStatusChanged');
            socket?.off('newOrder');
        };
    }, [socket, fetchDashboardData]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        try {
            await api.patch(`/orders/${orderId}`, { status: newStatus });
            toast.success(`Marked as ${newStatus.toLowerCase()}`);
            fetchDashboardData();
        } catch (err) {
            setOrders(previousOrders);
            toast.error("Update failed");
        }
    };

    if (loading || !stats) {
        return (
            <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-2 text-white">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-slate-100 p-4 md:p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                
                {/* Condensed Header */}
                <header className="flex justify-between items-center gap-4 mb-6 border-b border-white/5 pb-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">Admin Terminal</h1>
                        <p className="text-slate-500 text-sm">Gaza Pulse Live Queue</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <CSVLink 
                            data={reportData} 
                            filename={`Report-${new Date().toISOString().split('T')[0]}.csv`}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-2"
                        >
                            Export
                        </CSVLink>
                        <button onClick={logout} className="bg-white/5 hover:bg-red-900/20 text-slate-400 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-white/5">
                            Logout
                        </button>
                    </div>
                </header>

                {/* Smaller Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard title="Total" value={stats.totalOrders} color="blue" />
                    <StatCard title="Avg. Wait" value={`${stats.avgWaitTime}m`} color="emerald" />
                    <StatCard title="Pending" value={orders.filter(o => o.status === 'PENDING').length} color="amber" />
                </div>

                {/* Control Center */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Live Ticket List - Reduced height */}
                    <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[550px]">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                                Live Feed
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {orders.filter(o => o.status !== 'COMPLETED').length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700">
                                    <p className="font-black uppercase text-[10px] tracking-widest">Queue Clear</p>
                                </div>
                            ) : (
                                orders.filter(o => o.status !== 'COMPLETED').map((order) => (
                                    <div key={order.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:border-blue-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded">#{order.queueNumber}</span>
                                                <h4 className="text-md font-bold text-white mt-1">{order.customerName || "Guest"}</h4>
                                            </div>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {order.status === 'PENDING' && (
                                                <button onClick={() => handleUpdateStatus(order.id, 'PREPARING')} className="flex-1 bg-white/5 hover:bg-amber-500 text-white py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all">Prepare</button>
                                            )}
                                            {order.status === 'PREPARING' && (
                                                <button onClick={() => handleUpdateStatus(order.id, 'READY')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all">Mark Ready</button>
                                            )}
                                            {order.status === 'READY' && (
                                                <button onClick={() => handleUpdateStatus(order.id, 'COMPLETED')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all">Finish</button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="lg:col-span-7">
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-4 h-full">
                            <StatsChart data={stats} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => {
    const colors = {
        blue: "text-blue-500 bg-blue-500/5 border-blue-500/10",
        emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
        amber: "text-amber-500 bg-amber-500/5 border-amber-500/10"
    };

    return (
        <div className={`${colors[color]} border p-6 rounded-3xl group`}>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black tracking-tighter group-hover:translate-x-1 transition-transform">{value}</h3>
        </div>
    );
};

export default AdminDashboard;