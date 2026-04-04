import axios from "axios";
import { useEffect, useState } from "react"
import { io } from "socket.io-client";

const QueueDisplay=()=>{
    const [orders,setOrders]=useState([]);

    useEffect(()=>{
        axios.get('http://localhost:3000/api/orders').then(res=>{
            setOrders(res.data);
        });
        // why in every front page i open the socket and make the on then ? where is dry concept 

        const socket=io('http://localhost:3000');
        socket.on('orderUpdated',()=>{
            axios.get('http://localhost:3000/api/orders').then(res => setOrders(res.data));
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
        });
        return () =>socket.disconnect();
    },[]);
const preparing = orders.filter(o => o.status === 'preparing');
  const completed = orders.filter(o => o.status === 'completed').slice(0, 5); // عرض آخر 5 جاهزين فقط

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex gap-10">
      {/* قسم قيد التحضير */}
      <div className="flex-1 bg-slate-800 rounded-3xl p-8 border border-slate-700">
        <h2 className="text-3xl font-bold mb-10 text-amber-500 flex items-center gap-3">
          <span className="animate-pulse">●</span> جاري التحضير...
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {preparing.map(o => (
            <div key={o.id} className="bg-slate-700 p-6 rounded-2xl text-center">
              <span className="text-6xl font-black">{o.queueNumber}</span>
            </div>
          ))}
        </div>
      </div>

      {/* قسم الطلبات الجاهزة */}
      <div className="flex-1 bg-emerald-600 rounded-3xl p-8 shadow-2xl shadow-emerald-900/50">
        <h2 className="text-3xl font-bold mb-10 text-white">تفضل بالاستلام ✅</h2>
        <div className="space-y-6">
          {completed.map(o => (
            <div key={o.id} className="bg-white/20 backdrop-blur-md p-8 rounded-2xl flex justify-between items-center animate-bounce-short">
              <span className="text-8xl font-black">{o.queueNumber}</span>
              <span className="text-2xl font-bold">{o.customerName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;