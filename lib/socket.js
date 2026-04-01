import {Server} from 'socket.io';// why i am using socket escpeially ?


let io; // what is this io library make ?

export const initSocket=(server)=>{
    io=new Server (server,{
        cors:{
            origin:"*",
            methods:["GET",'POST'] // why we use only get and post ?
        }
    });

    io.on('connection',(socket)=>{
        console.log(`user connected: ${socket.id}`);

        socket.on('join_room',(userId)=>{ // what is the difference between socket.on and io.on ?
            // why i am using join room and join here ?
            socket.join(userId);
            console.log(`User ${socket.id} joined room ${userId}`);
        });
        socket.on('disconnect',()=>{
            console.log(`user disconnected: ${socket.id}`);
        });
    });
    return io;
}

export const getId=()=>{
    if(!io){
        throw new Error("Socket.io not initialized");
    }
    return io;
}