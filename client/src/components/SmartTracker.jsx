import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; 

const SmartTracker = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getStatusUI = (status) => {
        const states = {
            'PENDING': { percent: 30, time: '15', label: 'In Queue', color: 'bg-amber-500', glow: 'shadow-amber-500/20' },
            'PREPARING': { percent: 65, time: '8', label: 'Preparing', color: 'bg-blue-500', glow: 'shadow-blue-500/20' },
            'READY': { percent: 100, time: '0', label: 'Ready for Pickup', color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
            'COMPLETED': { percent: 100, time: '0', label: 'Order Completed', color: 'bg-slate-500', glow: 'shadow-slate-500/20' }
        };
        return states[status] || states['PENDING'];
    };

    const fetchLatestOrder = async () => {
        try {
            const res = await api.get(`/orders/my-orders?nocache=${Date.now()}`);
            if (res.data.success && res.data.data.length > 0) {
                setOrder(res.data.data[0]); 
                setError(null);
            } else {
                setOrder(null);
            }
        } catch (err) {
            setError("Sync failed. Checking connection...");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestOrder();
        const interval = setInterval(fetchLatestOrder, 7000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Updating Status...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-blue-600/10 w-20 h-20 rounded-full mb-8 flex items-center justify-center">
                    <span className="text-3xl text-blue-500">🛒</span>
                </div>
                <h2 className="text-3xl font-black mb-3">No Active Orders</h2>
                <p className="text-slate-500 mb-10 max-w-xs">We couldn't find any active tickets linked to this session.</p>
                <button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                    Get a Ticket
                </button>
            </div>
        );
    }

    const ui = getStatusUI(order.status);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 flex items-center justify-center">
            <div className="w-full max-w-md">
                {/* Main Ticket Card */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-12 text-center mb-8 shadow-3xl relative overflow-hidden group">
                    <div className={`absolute top-0 inset-x-0 h-1 ${ui.color}`}></div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Your Ticket Number</p>
                    <h1 className="text-[140px] font-black leading-none mb-8 tracking-tighter text-white transition-all group-hover:scale-105">
                        {order.queueNumber.toString().padStart(3, '0')}
                    </h1>
                    
                    <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/5 bg-white/5 ${ui.glow}`}>
                        <span className={`w-2 h-2 rounded-full ${ui.color} animate-ping`}></span>
                        {ui.label}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-10 px-4">
                    <div className="flex justify-between mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Process Progress</span>
                        <span>{ui.percent}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${ui.color} transition-all duration-1000 ease-out`} style={{ width: `${ui.percent}%` }}></div>
                    </div>
                </div>

                {/* Wait Time Info */}
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-xl shadow-inner">⏳</div>
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Est. Wait Time</p>
                            <p className="text-xl font-black text-white">{ui.time} <span className="text-xs text-slate-400">MINS</span></p>
                        </div>
                    </div>
                    <div className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity">→</div>
                </div>
            </div>
        </div>
    );
};

export default SmartTracker;