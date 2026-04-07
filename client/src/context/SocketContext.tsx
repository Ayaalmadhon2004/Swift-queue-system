import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // 1. الاتصال بالسيرفر مع تفعيل الكوكيز
        const newSocket = io('http://localhost:3000', {
            withCredentials: true, // 👈 هذه هي الإضافة الأهم للسماح بإرسال الكوكيز
            transports: ['websocket'], // لضمان أداء أسرع ومستقر
        });

        setSocket(newSocket);

        // 2. تنظيف الاتصال عند إغلاق التطبيق
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);