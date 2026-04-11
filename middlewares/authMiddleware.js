import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';

// دالة مساعدة لاستخراج والتحقق من الـ Token
const getDecodedToken = (req) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const protect = asyncHandler(async (req, res, next) => {
    const decoded = getDecodedToken(req);

    if (!decoded) {
        const err = new Error('Not authorized, please login');
        err.statusCode = 401;
        throw err;
    }

    req.userId = decoded.userId;
    next();
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
    const decoded = getDecodedToken(req);

    if (decoded) {
        req.userId = decoded.userId;
    }
    
    next(); 
});