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