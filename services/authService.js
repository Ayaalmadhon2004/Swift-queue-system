import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

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
//what is the difference between 400 and 401 and 404?
export const updatePassword=async(userId,currentPassword,newPassword)=>{
    const user = await prisma.user.findUnique({where:{id:userId}});
    if(!user) throw new Error("User not found");
    const isMatch=awiat bcrypt.compare(oldPassword,user.password);
    if(!isMatch){
        const error=new Error("Current password is incorrect");
        error.statusCode=401;
        throw error;
    }

    const salt=await bcrypt.genSalt(10);//what is salt and usage 
    const hashedPassword=await bcrypt.hash(newPassword,salt);

    await prisma.user.update({
        where:{id:userId},
        data:{password:hashedPassword}
    });
    return true;
}

// tell me all crud we user after prisma.user.??? update,findUnique...??