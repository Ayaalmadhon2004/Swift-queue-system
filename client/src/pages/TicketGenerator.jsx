import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const TicketGenerator = () => {
  const [customerName, setCustomerName] = useState('');
  const [ticket, setTicket] = useState(null);
  const queryClient = useQueryClient();
  const socket = useSocket();

  // 1. Fetch Waiting Count with safety fallback
  const { data: waitingCount = 0 } = useQuery({
    queryKey: ['pendingCount'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/orders/count/pending');
        // Handle cases where data might be nested in data.data or data.count
        return data?.count ?? data?.data?.count ?? 0;
      } catch (err) {
        console.error("Fetch Pending Error:", err);
        return 0;
      }
    }
  });

  // 2. Mutation for creating the ticket
  const mutation = useMutation({
    mutationFn: (name) => api.post('/orders/public/create', { customerName: name }),
    onSuccess: (response) => {
      const newTicket = response.data?.data || response.data;
      setTicket(newTicket);
      queryClient.invalidateQueries(['pendingCount']);
      toast.success("Ticket Generated Successfully!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const message = error.response?.data?.message || "Server connection failed (404/500)";
      toast.error(message);
    }
  });

  // 3. Real-time Sync via Socket
  useEffect(() => {
    if (socket) {
      const refresh = () => queryClient.invalidateQueries(['pendingCount']);
      
      socket.on('orderStatusChanged', refresh);
      socket.on('newOrder', refresh);

      return () => {
        socket.off('orderStatusChanged', refresh);
        socket.off('newOrder', refresh);
      };
    }
  }, [socket, queryClient]);

  const handleJoinQueue = (e) => {
    e.preventDefault();
    if (customerName.trim()) {
      mutation.mutate(customerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      {!ticket ? (
        <div className="w-full max-w-md text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white tracking-tighter italic">SwiftQueue<span className="text-blue-600">.</span></h1>
            <p className="text-slate-500 text-lg font-medium">Please book your turn below</p>
          </div>

          <form onSubmit={handleJoinQueue} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name..."
              className="w-full p-6 rounded-[2rem] bg-white/[0.03] border-2 border-white/5 focus:border-blue-600 focus:bg-white/[0.05] outline-none text-center text-2xl transition-all placeholder:text-slate-700"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={mutation.isPending}
              required
            />
            <button
              type="submit"
              disabled={mutation.isPending || !customerName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : 'Get Your Number Now'}
            </button>
          </form>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">In Queue</p>
              <p className="text-blue-500 font-black text-4xl">{waitingCount}</p>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Wait Time</p>
              <p className="text-white font-black text-4xl">{waitingCount * 5}<span className="text-sm ml-1 text-slate-500">min</span></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="space-y-2">
             <p className="text-sm font-black text-blue-500 uppercase tracking-[0.3em]">Confirmation</p>
             <p className="text-4xl font-black text-white tracking-tight">Your Entry Ticket</p>
          </div>
          
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20 animate-pulse"></div>
            <div className="relative text-[14rem] leading-none font-black text-white tracking-tighter">
              {ticket.queueNumber}
            </div>
          </div>

          <div className="bg-white/[0.03] p-10 rounded-[3rem] border border-white/10 backdrop-blur-md max-w-sm mx-auto">
            <p className="text-xl font-medium text-slate-300">
              Welcome, <span className="text-white font-black">{ticket.customerName}</span>
            </p>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Your ticket is confirmed. Please keep this screen open or remember your number.
            </p>
          </div>

          <button 
            onClick={() => { setTicket(null); setCustomerName(''); }} 
            className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-white/5"
          >
            New Registration
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketGenerator;