import {Server} from 'socket.io';


let io; 

export const initSocket=(server)=>{
    io=new Server (server,{
        cors:{
            origin:"*",
            methods:["GET",'POST'] 
        }
    });

    io.on('connection',(socket)=>{
        console.log(`user connected: ${socket.id}`);

        socket.on('join_room',(userId)=>{ 
            socket.join(userId);
            console.log(`User ${socket.id} joined room ${userId}`);
        });
        socket.on('disconnect',()=>{
            console.log(`user disconnected: ${socket.id}`);
        });
    });
    return io;
}

export const getIO=()=>{
    if(!io){
        throw new Error("Socket.io not initialized");
    }
    return io;
}