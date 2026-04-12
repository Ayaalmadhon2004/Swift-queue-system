import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../services/orderService';

const EnhancedQueuePage = () => {
    const [name, setName] = useState('');
    const [nextNumber, setNextNumber] = useState('000');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await OrderService.getStats();
                if (res.data.success) {
                    const total = res.data.data.totalOrders || 0;
                    const next = (total + 1).toString().padStart(3, '0');
                    setNextNumber(next);
                }
            } catch (error) {
                console.error("Queue Stats Error:", error);
            }
        };
        fetchInitialData();
    }, []);

    const handleGetNumber = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await OrderService.create(name);
            if (res.data) {
                localStorage.setItem('currentOrder', JSON.stringify(res.data));
                navigate('/tracker'); 
            }
        } catch (error) {
            console.error("Create Order Error:", error);
            alert("Network error: Please ensure the server is online.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans select-none relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-16 relative">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-900/40">Q</div>
                <span className="text-3xl font-black tracking-tighter uppercase">Queue<span className="text-blue-500">Flow</span></span>
            </div>

            <div className="w-full max-w-lg text-center relative">
                <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">Get Your <br/>Queue Number</h1>
                <p className="text-slate-500 mb-12 text-xl font-medium">Skip the line. Smart tracking, zero waiting.</p>

                {/* Main Card */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[3.5rem] p-12 shadow-3xl relative backdrop-blur-3xl group">
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Next Available Slot</span>
                    
                    <div className="text-[140px] leading-none font-black text-white mb-12 tracking-tighter transition-all duration-700 group-hover:scale-105 group-hover:text-blue-500/90">
                        {nextNumber}
                    </div>

                    <form onSubmit={handleGetNumber} className="space-y-5">
                        <input 
                            type="text" 
                            placeholder="Enter your name (optional)" 
                            className="w-full bg-[#111] border border-white/5 rounded-2xl p-6 text-center text-lg outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-700 text-white font-bold"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                                loading 
                                ? 'bg-slate-900 text-slate-600 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_20px_40px_rgba(37,99,235,0.2)]'
                            }`}
                        >
                            {loading ? "Registering..." : "Get My Ticket 🎟"}
                        </button>
                    </form>
                </div>

                <button 
                    onClick={() => navigate('/display')} 
                    className="mt-16 text-slate-500 hover:text-blue-400 text-xs font-bold transition-all uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                    Launch Public Board ↗
                </button>
            </div>
        </div>
    );
};

export default EnhancedQueuePage;