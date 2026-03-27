import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import orderRoutes from './routes/orderRoutes.js';
import morgan from 'morgan';

const app=express();
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/orders',orderRoutes);

app.get('/',(req,res)=>res.send("swiftQueue secure"));
const PORT=process.env.PORT || 3000;

app.listen(PORT ,()=>{
    console.log(`swift queue server is running on port ${PORT}`);
});