import {Server} from 'socket.io';// why i am using socket escpeially ?


let io; // what is this io library make ?

export const initSocket=(server)=>{
    io=new Server (server,{

    })
}