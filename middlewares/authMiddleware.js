import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // 2. أو البحث عنه في الـ Headers (للاحتياط أو لطلبات الـ Mobile مستقبلاً)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        const err = new Error('Not authorized, no token found');
        err.statusCode = 401;
        throw err;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId; 
        next();
    } catch (error) {
        const err = new Error('Not authorized, token failed');
        err.statusCode = 401;
        throw err;
    }
});


export const optionalProtect = asyncHandler(async(req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        
    }
})