import 'dotenv/config'; 
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import cookieParser from 'cookie-parser'; 
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

// استيراد الروابط (Routes)
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';

// استيراد الميدلوير والمكتبات المساعدة
import { errorHandler } from './middlewares/errorMiddleware.js';
import { specs } from './docs/swagger.js';
import { initSocket } from './lib/socket.js'; // تأكدي أن الملف في مجلد lib أو حسب مساره عندك

const app = express(); 
const server = http.createServer(app); 

/**
 * 1. إعداد Socket.io الموحد
 * قمنا باستخدام initSocket لضمان عدم تكرار الخادم ومنع أخطاء الاتصال في الـ Tracker
 */
const io = initSocket(server);
app.set('socketio', io); // لجعل io متاحاً داخل الـ Controllers عبر req.app.get('socketio')

/**
 * 2. إعدادات CORS
 * تدعم كافة منافذ Vite التي تظهر في مشروعك لضمان عدم حظر الطلبات
 */
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

/**
 * 3. الميدلوير الأساسية
 */
app.use(cookieParser()); 
app.use(express.json());
app.use(morgan('dev')); // لتتبع الطلبات في الـ Terminal
app.use(helmet({
    contentSecurityPolicy: false, // لضمان عمل Swagger وواجهات الـ UI بدون قيود أمنية أثناء التطوير
}));

/**
 * 4. تحديد معدل الطلبات (Rate Limiting)
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 1000, 
    message: {
        error: "Too many requests from this IP",
        message: "Please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter); 

/**
 * 5. تعريف المسارات (Routes)
 */
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// اختبار السيرفر
app.get('/', (req, res) => res.send("✅ SwiftQueue Secure Server is Live 🚀"));

/**
 * 6. معالج الأخطاء المركزي
 * يجب أن يكون آخر ميدلوير ليتمكن من التقاط كافة أخطاء الـ Routes
 */
app.use(errorHandler);

/**
 * 7. تشغيل السيرفر
 */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ SwiftQueue server is running on port ${PORT}`);
});