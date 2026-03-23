import express from 'express';
import helmet from 'helmet';

const app=express();
app.use(helmet());

app.get('/',(req,res)=>res.send("swiftQueue secure"));
const PORT=3000;

app.listen(PORT ,()=>{
    console.log(`swift queue server is running on port ${PORT}`);
});