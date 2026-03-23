const orderBuffer=[];

export const createOrder=(req,res)=>{
    const {userId,productId}=req.body;

    orderBuffer.push({userId,productId,timestamp:new Date()});

    res.status(201).json({
        message:"Order received and is being processed",
        queueLength:orderBuffer.length
    });
}