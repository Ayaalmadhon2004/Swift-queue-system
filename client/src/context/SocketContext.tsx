import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null >(null);
export const SocketProvider = ({children}:{children: ReactNode}) => {
    const socket = io('http://localhost:3000', {
        auth:{token: localStorage.getItem('token')}
    });
    useEffect(()=>{
        return () =>{
            socket.disconnect();
        };
    },[socket]);
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);