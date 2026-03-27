import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes.js';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const limiter=rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:{
        error:"Too many requests from this IP, please try again after 15 minutes.",
        message:"Please try again after 15 minutes"
    },
    standardHeaders:true,
    legacyHeaders:false,
});

const app=express();

app.use(limiter);
app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(morgan('dev'));
app.use('/api/orders',orderRoutes);

app.get('/',(req,res)=>res.send("swiftQueue secure"));
const PORT=process.env.PORT || 3000;

app.listen(PORT ,()=>{
    console.log(`swift queue server is running on port ${PORT}`);
});