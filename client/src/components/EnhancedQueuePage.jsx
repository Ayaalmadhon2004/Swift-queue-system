import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../services/orderService';

const EnhancedQueuePage = () => {
    const [name, setName] = useState('');
    const [nextNumber, setNextNumber] = useState('---');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // جلب رقم الطابور القادم عند تحميل الصفحة
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await OrderService.getStats();
                if (res.data.success) {
                    // نأخذ إجمالي الطلبات من الـ Controller ونضيف 1
                    const total = res.data.data.totalOrders || 0;
                    const next = (total + 1).toString().padStart(3, '0');
                    setNextNumber(next);
                }
            } catch (error) {
                console.error("Failed to fetch queue stats:", error);
            }
        };
        fetchInitialData();
    }, []);

    const handleGetNumber = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await OrderService.create(name);
            
            // السيرفر يرسل النتيجة مباشرة (res.data)
            if (res.data) {
                // تخزين المعرف محلياً لسهولة التتبع في صفحة الـ Tracker
                localStorage.setItem('currentOrder', JSON.stringify(res.data));
                navigate('/tracker'); 
            }
        } catch (error) {
            console.error("Error creating order:", error);
            alert("حدث خطأ أثناء حجز الرقم، تأكد من اتصال السيرفر.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans select-none">
            {/* Logo Section */}
            <div className="flex items-center gap-2 mb-12">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl">Q</div>
                <span className="text-2xl font-bold tracking-tight">QueueFlow</span>
            </div>

            <div className="w-full max-w-md text-center">
                <h1 className="text-4xl font-black mb-3 tracking-tight">Get Your Queue Number</h1>
                <p className="text-gray-500 mb-10 text-lg">Skip the wait. Get notified when you're ready.</p>

                {/* Main Card */}
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full"></div>
                    
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Next Available Number</span>
                    
                    <div className="text-[120px] leading-none font-black text-white mb-10 transition-transform duration-500 group-hover:scale-105">
                        {nextNumber}
                    </div>

                    <form onSubmit={handleGetNumber} className="space-y-4 relative">
                        <input 
                            type="text" 
                            placeholder="Your name (optional)" 
                            className="w-full bg-[#181818] border border-gray-800 rounded-2xl p-5 text-center text-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                                loading 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                            }`}
                        >
                            {loading ? "Processing..." : "Get Your Number 🎟"}
                        </button>
                    </form>
                </div>

                <button 
                    onClick={() => navigate('/public')} 
                    className="mt-12 text-gray-500 hover:text-blue-500 text-sm font-medium transition-colors underline underline-offset-8 decoration-gray-800"
                >
                    View Public Display
                </button>
            </div>
        </div>
    );
};

export default EnhancedQueuePage;