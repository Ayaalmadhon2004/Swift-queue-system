import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useSocket } from '../context/SocketContext';

const TicketGenerator = () => {
  const [customerName, setCustomerName] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const socket = useSocket();

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

    if (socket) {
      socket.on('orderStatusChanged', fetchWaitingCount);
      socket.on('newOrder', fetchWaitingCount);
    }

    return () => {
      if (socket) {
        socket.off('orderStatusChanged', fetchWaitingCount);
        socket.off('newOrder', fetchWaitingCount);
      }
    };
  }, [socket]);

  const handleJoinQueue = async (e) => {
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

  const handleGetTicket=async()=>{
    try{
      const guestId = localStorage.getItem('guestId') || `guest_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestId',guestId);

      const response = await api.post('/orders',{
        guestName:'guest swift ',
        tempId:guestId
      });

      Navigate('/my-orders');
    } catch (err){
      console.error('failed in have ticket',err);
    }
  };

  const estimatedTime = waitingCount * 5;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      {!ticket ? (
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white tracking-tighter">SwiftQueue</h1>
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
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black text-2xl shadow-xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'جاري استخراج التذكرة...' : 'احجز دورك الآن'}
            </button>
          </form>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">في الانتظار</p>
              <p className="text-blue-400 font-bold text-3xl">{waitingCount}</p>
            </div>
            <div className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-3xl">
              <p className="text-blue-400 text-sm mb-1">وقت تقريبي</p>
              <p className="text-white font-bold text-3xl">{estimatedTime}د</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-10 animate-in fade-in zoom-in duration-500">
          <p className="text-3xl text-blue-400 font-bold">رقم دورك هو</p>
          <div className="text-[12rem] leading-none font-black text-white drop-shadow-2xl">
            {ticket.queueNumber}
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
            <p className="text-3xl font-medium">شكراً لك، <span className="text-blue-400 font-black">{ticket.customerName}</span>!</p>
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