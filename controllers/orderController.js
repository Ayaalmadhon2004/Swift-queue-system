const orderBuffer=[];

export const createOrder=(req,res)=>{
    try{

        if(!req.body || Object.keys(req.body).length===0){
            return res.status(400).json({
                error:"Request body is missing or empty",
                tip:"Make sure to send a JSON body with userId and productId"
            });
        }
        const {userId,productId}=req.body;

        if(!userId){
            return res.status(400).json({error:"userId is required"});
        }

        const newOrder={
            userId,
            productId,
            timestamp:new Date()
        };

        orderBuffer.push(newOrder);

        res.status(201).json({
            success:true,
            message:"Order received and is being processed",
            queueLength:orderBuffer.length
        });

    }catch(error){
        res.status(500).json({error:"Internal Server Error"});
    }
};

// دالة لمحاكاة معالجة الطلبات (مثلاً حفظها في قاعدة البيانات)
const processOrders = () => {
    if (orderBuffer.length > 0) {
        console.log(`🚀 Processing ${orderBuffer.length} orders...`);
        
        // هنا نقوم بتفريغ الطابور بعد معالجته
        // في المستقبل، هنا سنستخدم Prisma لحفظ البيانات
        orderBuffer.length = 0; 
        
        console.log("✅ Queue cleared.");
    } else {
        console.log("😴 No orders to process. Waiting...");
    }
};

// تشغيل المعالج كل 10 ثوانٍ تلقائياً
setInterval(processOrders, 10000);