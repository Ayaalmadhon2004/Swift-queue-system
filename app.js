import 'dotenv/config'; // هذا السطر كافٍ لتحميل المتغيرات فوراً
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import swaggerUi from 'swagger-ui-express'; // تأكدي من إضافة هذا الـ import

// استيراد المسارات والملفات الخاصة بكِ
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { initSocket } from './lib/socket.js';
import { initCronJobs } from './utils/cronJobs.js';
import { specs } from './docs/swagger.js';

const app = express();
const server = http.createServer(app); // إنشاء السيرفر أولاً ليتم تمريره للـ Socket

// 1. تهيئة الخدمات الخارجية (Initialization)
initSocket(server); 
initCronJobs();

// 2. الميدل وير الأساسية (Global Middlewares)
app.use(helmet());
app.use(cors());
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
app.use('/api/', limiter); // تطبيق المحدد على مسارات الـ API فقط

// 3. المسارات (Routes)
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => res.send("SwiftQueue Secure Server is Live 🚀"));

// 4. معالجة الأخطاء (يجب أن تكون آخر شيء)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// تشغيل السيرفر من خلال الكائن server (وليس app) ليعمل الـ Socket.io
server.listen(PORT, () => {
    console.log(`✅ SwiftQueue server is running on port ${PORT}`);
});