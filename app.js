import 'dotenv/config'; 
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

// استيراد المسارات والملفات الخاصة بكِ
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
// تأكدي من وجود هذه الملفات في مساراتها الصحيحة
// import { initSocket } from './lib/socket.js'; 
// import { initCronJobs } from './utils/cronJobs.js';
import { specs } from './docs/swagger.js';

const app = express(); // ✅ 1. تعريف التطبيق أولاً
const server = http.createServer(app); // 2. إنشاء السيرفر

// 3. الميدل وير الأساسية (Global Middlewares)
app.use(cors({
    origin: 'http://localhost:5173', // منفذ Vite الخاص بكِ
    credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests from this IP",
        message: "Please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => res.send("SwiftQueue Secure Server is Live 🚀"));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`✅ SwiftQueue server is running on port ${PORT}`);
});