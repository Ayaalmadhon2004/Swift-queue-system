import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async(req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token=req.headers.authorization.split(' ')[1];
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            req.userId=decoded.userId;
            next();
        } catch(error){
            const err=new Error('Not authorization , token failed');
            err.statusCode=401;
            throw err;
        }
    }

    if(!token){
        const err=new Error('Not authorized , no taken');
        err.statusCode=401;
        throw err;
    }
});