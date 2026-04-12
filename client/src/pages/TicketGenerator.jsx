import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { useSocket } from '../context/SocketContext';

const TicketGenerator = () => {
  const [customerName, setCustomerName] = useState('');
  const [ticket, setTicket] = useState(null);
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: waitingCount = 0 } = useQuery({
    queryKey: ['pendingCount'],
    queryFn: async () => {
      const { data } = await api.get('/orders/count/pending');
      return data.count;
    }
  });

  const mutation = useMutation({
    mutationFn: (name) => api.post('/orders/public/create', { customerName: name }),
    onSuccess: (response) => {
      setTicket(response.data);
      queryClient.invalidateQueries(['pendingCount']);
    },
    onError: () => alert("An error occurred. Please try again later.")
  });

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
    if (customerName.trim()) mutation.mutate(customerName);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      {!ticket ? (
        <div className="w-full max-w-md text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white tracking-tighter">SwiftQueue</h1>
            <p className="text-slate-400 text-xl">Welcome! Please book your turn</p>
          </div>
          <form onSubmit={handleJoinQueue} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name..."
              className="w-full p-6 rounded-3xl bg-slate-800 border-2 border-slate-700 focus:border-blue-500 outline-none text-center text-2xl transition-all"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black text-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {mutation.isPending ? 'Generating Ticket...' : 'Get Your Number Now'}
            </button>
          </form>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Waiting</p>
              <p className="text-blue-400 font-bold text-3xl">{waitingCount}</p>
            </div>
            <div className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-3xl">
              <p className="text-blue-400 text-sm mb-1">Est. Time</p>
              <p className="text-white font-bold text-3xl">{waitingCount * 5}m</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-10 animate-in fade-in zoom-in duration-500">
          <p className="text-3xl text-blue-400 font-bold">Your Number is</p>
          <div className="text-[12rem] leading-none font-black text-white drop-shadow-2xl">
            {ticket.queueNumber}
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
            <p className="text-3xl font-medium">Thank you, <span className="text-blue-400 font-black">{ticket.customerName}</span>!</p>
            <p className="text-slate-400 mt-2">Please wait until your number appears on the screen</p>
          </div>
          <button onClick={() => { setTicket(null); setCustomerName(''); }} className="text-slate-500 text-lg hover:text-white transition-colors underline underline-offset-8">
            Book Another Ticket
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketGenerator;