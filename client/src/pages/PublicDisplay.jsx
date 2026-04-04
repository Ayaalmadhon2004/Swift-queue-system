import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const PublicDisplay = () => {
    const [readyOrders, setReadyOrders] = useState([]);
    const [processingOrders, setProcessingOrders] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const res = await axios.get('http://localhost:3000/api/orders/public');
            setReadyOrders(res.data.filter(o => o.status === 'READY'));
            setProcessingOrders(res.data.filter(o => o.status === 'PREPARING'));

            socket.on('orderReady', (order) => {
            const msg = new SpeechSynthesisUtterance();
            msg.text = `طلب رقم ${order.queueNumber} جاهز للاستلام`;
            msg.lang = 'ar-SA'; 
            window.speechSynthesis.speak(msg);
        });
        };
        fetchInitialData();

        // why i am using io and on in every front page section ?????
        const socket = io('http://localhost:3000');
        socket.on('orderStatusChanged', (updatedOrder) => {
            refreshLists(updatedOrder);
            // refreshLists(update order from where i have it ? 
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div className="h-screen bg-gray-900 text-white p-10 flex flex-col">
            <header className="text-center mb-10">
                <h1 className="text-5xl font-black text-blue-400">SwiftQueue</h1>
                <p className="text-xl text-gray-400 mt-2">يرجى استلام الطلبات الجاهزة</p>
            </header>

            <div className="grid grid-cols-2 gap-10 flex-1">
                <div className="bg-green-900/20 border-2 border-green-500 rounded-3xl p-8 text-center">
                    <h2 className="text-3xl font-bold text-green-400 mb-8 underline">جاهز للاستلام ✅</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {readyOrders.map(order => (
                            <div key={order.id} className="text-7xl font-black animate-bounce">
                                {order.queueNumber}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-900/10 border-2 border-blue-500 rounded-3xl p-8 text-center">
                    <h2 className="text-3xl font-bold text-blue-400 mb-8 underline">قيد التحضير ⏳</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {processingOrders.map(order => (
                            <div key={order.id} className="text-4xl font-bold text-gray-400">
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


// what is the difference between these codes ?
import React, { useState } from 'react';
import axios from 'axios';

const PublicDisplay = () => {
  const [customerName, setCustomerName] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);

  const handleJoinQueue = async (e) => {
    e.preventDefault();
    if (!customerName) return alert("الرجاء إدخال اسمك");

    setLoading(true);
    try {
      // التأكد من أن الرابط يطابق الباك أند (Port 3000)
      const response = await axios.post('http://localhost:3000/api/orders/public/create', {
        customerName
      });
      setTicket(response.data);
    } catch (err) {
      console.error(err);
      alert("عذراً، حدث خطأ أثناء حجز الدور");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if(ticket) {
     axios.get('http://localhost:3000/api/orders/count/pending')
          .then(res => setWaitingCount(res.data.count));
  }
}, [ticket]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      {!ticket ? (
        <div className="w-full max-w-md text-center space-y-8">
          <h1 className="text-5xl font-black mb-4">SwiftQueue</h1>
          <p className="text-slate-400">أهلاً بك! أدخل اسمك للحصول على رقم دورك</p>
          
          <form onSubmit={handleJoinQueue} className="space-y-4">
            <input
              type="text"
              placeholder="اسمك الكريم"
              className="w-full p-5 rounded-2xl bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none text-center text-xl"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95"
            >
              {loading ? 'جاري الحجز...' : 'احجز دورك الآن'}
            </button>
          </form>
          <div className="mt-4 p-4 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-sm">هناك <span className="text-blue-400 font-bold">{waitingCount}</span> عملاء ينتظرون أمامك</p>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6 animate-bounce-slow">
          <p className="text-2xl text-blue-400 font-bold uppercase tracking-widest">رقمك هو</p>
          <div className="text-[12rem] leading-none font-black text-white drop-shadow-2xl">
            {ticket.queueNumber}
          </div>
          <p className="text-2xl font-medium">شكراً لك، {ticket.customerName}!</p>
          <button 
            onClick={() => {setTicket(null); setCustomerName('');}}
            className="text-slate-500 underline"
          >
            حجز تذكرة أخرى
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicDisplay;