import { useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/my-orders');
                setOrders(data.data);
            } catch (err) {
                console.error("Failed to fetch orders");
            }
        };
        fetchOrders();
        const socket = io('http://localhost:3000', {
            auth: { token: localStorage.getItem('token') }
        });
        socket.on('status_updated', (update) => {
            setOrders(prev => prev.map(order => 
                order.id === update.orderId ? { ...order, status: update.newStatus } : order
            ));
        });

        return () => socket.disconnect(); 
    }, []);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 👋</h1>
                    <button onClick={logout} className="text-red-500 font-medium hover:underline">Logout</button>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 font-semibold text-gray-700">Your Orders</div>
                    <div className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <div key={order.id} className="p-6 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;