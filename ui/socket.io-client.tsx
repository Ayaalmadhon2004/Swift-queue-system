import { useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

//teach me the steps of the code 
const Dashboard = () =>{
    const {user} =useContext(AuthContext);
    const [myOrders,setMyOrders]=useState([]);
    const [socket,setSocket]=useState(null);

    useEffect(()=>{
        const fetchOrders=async()=>{
            const {data} = await api.get('/orders/my-orders');
            setMyOrders(data.data);
        };
        fetchOrders();

        // i dont know here io , it is like open the socket of localhost or what ? 
        const newSocket=io('http://localhost:3000',{
            auth:{token:localStorage.getItem('token')}
        });
           // what will happen in newSocket.on ? on what will happen ?
        newSocket.on('status_updated',(data)=>{
            setMyOrders(prev=>prev.map(order=>
                order.id === data.orderId ? {...order,status:data.newStatus} : order
            ));
            alert(data.message);
        });
        setSocket(newSocket);
        return () => newSocket.clone();
    },[]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}</h1>
            <div className="grid gap-4">
                {myOrders.map(order => (
                    <div key={order.id} className="p-4 bg-white border rounded shadow flex justify-between">
                        <span>Order #{order.id.slice(-5)}</span>
                        <span className={`px-3 py-1 rounded text-white ${
                            order.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}