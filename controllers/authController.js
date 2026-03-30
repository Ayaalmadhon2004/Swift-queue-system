import * as authService from '../services/authService.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register=asyncHandler(async(requestAnimationFrame,res)=>{
    const validatedData=registerSchema.parse(req.body);
    const user=await authService.registerUser(validatedData);
    res.status(201).json({
        success:true,
        message: "User registered successfully",
        data: { id: user.id, email: user.email, name: user.name }
    });
});

export const login=asyncHandler(async(req,res)=>{
    const {email,password}=loginSchema.parse(req.body);
    const {user,token}=await authService.loginSchema(email,password);

    res.status(200).json({
        success:true,
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, name: user.name }
    });
});