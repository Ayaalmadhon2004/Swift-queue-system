export const requestNotificationPermission = async()=>{
    if(!("Notification" in window)){
        console.log("this browser don't support notification descktop");
        return ;
    }

    if(Notification.permission !=="granted"){
        await Notification.requestPermission();
        //request permission it will make direct ? without any long code?
        //how to take notification access ?
    }
};

export const sendNotification=(title,options)=>{
    if(Notification.permission==="granted"){
        new Notification(title,options);
    }
};