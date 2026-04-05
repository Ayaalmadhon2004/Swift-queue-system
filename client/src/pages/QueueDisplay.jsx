import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useSocket } from "../context/SocketContext";

const QueueDisplay = () => {
  const [orders, setOrders] = useState([]);
  const socket = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket) {
      socket.on("orderUpdated", () => {
        fetchOrders();
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(() => {});
      });
    }

    return () => {
      if (socket) socket.off("orderUpdated");
    };
  }, [socket]);

  const preparing = orders.filter((o) => o.status === "preparing");
  const completed = orders.filter((o) => o.status === "completed").slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex gap-10" dir="rtl">
      <div className="flex-1 bg-slate-800 rounded-3xl p-8 border border-slate-700">
        <h2 className="text-3xl font-bold mb-10 text-amber-500 flex items-center gap-3">
          <span className="animate-pulse">●</span> جاري التحضير...
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {preparing.map((o) => (
            <div key={o.id} className="bg-slate-700 p-6 rounded-2xl text-center">
              <span className="text-6xl font-black">{o.queueNumber}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-emerald-600 rounded-3xl p-8 shadow-2xl shadow-emerald-900/50">
        <h2 className="text-3xl font-bold mb-10 text-white">تفضل بالاستلام ✅</h2>
        <div className="space-y-6">
          {completed.map((o) => (
            <div key={o.id} className="bg-white/20 backdrop-blur-md p-8 rounded-2xl flex justify-between items-center">
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