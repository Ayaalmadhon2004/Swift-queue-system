import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const registerSchema = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
        data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name
        }
    });
    return user;
};

export const loginSchema = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return { user, token };
};

export const getUserProfile=async(userId)=>{ // this parameter userId it comes from prisma ? 
    return await prisma.user.findUnique({
        where:{id:userId},
        select:{
            id:true,
            name:true,
            email:true,
            createdAt:true,
            orders:{
                orderBy:{createdAt:'desc'},
                take:5
            }
        }
    });
}

export const updateUserProfile=async (userId,updateData)=>{
    return await prisma.user.update({
        where:{id:userId},
        data:{
            name:updateData.name,
            email:updateData.email
        },
        select:{
            id:true,
            name:true,
            email:true
        }
    });
};

// tell me all crud we user after prisma.user.??? update,findUnique...??