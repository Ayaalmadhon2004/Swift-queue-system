import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const TicketGenerator = () => {
  const [customerName, setCustomerName] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);

  const fetchWaitingCount = async () => {
    try {
      const { data } = await api.get('/orders/count/pending');
      setWaitingCount(data.count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWaitingCount();
  }, [ticket]);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/orders/public/create', { customerName });
      setTicket(data);
    } catch (err) {
      alert("حدث خطأ أثناء الحجز، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      {!ticket ? (
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white">SwiftQueue</h1>
            <p className="text-slate-400 text-xl">أهلاً بك! يرجى حجز رقم دورك</p>
          </div>
          
          <form onSubmit={handleJoinQueue} className="space-y-4">
            <input
              type="text"
              placeholder="أدخل اسمك هنا..."
              className="w-full p-6 rounded-3xl bg-slate-800 border-2 border-slate-700 focus:border-blue-500 outline-none text-center text-2xl transition-all"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black text-2xl shadow-xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'جاري استخراج التذكرة...' : 'احجز دورك الآن'}
            </button>
          </form>

          <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
            <p className="text-slate-400">عدد الأشخاص في الانتظار: <span className="text-blue-400 font-bold text-2xl">{waitingCount}</span></p>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-10 animate-in fade-in zoom-in duration-500">
          <div className="space-y-2">
            <p className="text-3xl text-blue-400 font-bold uppercase tracking-[0.2em]">رقم دورك هو</p>
            <div className="text-[15rem] leading-none font-black text-white drop-shadow-2xl">
              {ticket.queueNumber}
            </div>
          </div>
          <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10">
            <p className="text-3xl">شكراً لك، <span className="text-blue-400 font-bold">{ticket.customerName}</span>!</p>
            <p className="text-slate-400 mt-2">يرجى الانتظار حتى ظهور رقمك على الشاشة</p>
          </div>
          <button 
            onClick={() => { setTicket(null); setCustomerName(''); }}
            className="text-slate-500 text-lg hover:text-white transition-colors underline underline-offset-8"
          >
            حجز تذكرة أخرى
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketGenerator;