import * as authService from '../services/authService.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(validatedData);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { id: user.id, email: user.email, name: user.name }
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const { user, token } = await authService.loginUser(email, password);

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const updateUser = await authService.updateUserProfile(req.userId, { name, email });
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updateUser
    });
});

export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        const error = new Error("Please provide current and new password");
        error.statusCode = 400;
        throw error;
    }
    await authService.updatePassword(req.userId, currentPassword, newPassword);
    res.status(200).json({ success: true, message: "Password updated successfully" });
});