import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma=new PrismaClient();

async function main(){
    const hashedPassword=await bcrypt.hash('admin123',10);

    const admin=await prisma.user.upsert({
        where:{email:'admin@example.com'},
        update:{},
        create:{
            email:'admin@example.com',
            name:'Admin User',
            password:hashedPassword,
            role:'admin'
        },
    });
    
    const products=await Promise.all([
        prisma.product.create({data:{name:'VIP Consultation',price:100}}),
        prisma.product.create({data:{name:'Standard Consultation',price:50}}),
        prisma.product.create({data:{name:'Express Consultation',price:30}}),
    ]);
    console.log(`✅ Created ${products.length} products`);
}

main()
    .catch((e)=>{
        console.error(e);
        process.exit(1);
    })
    .finally(async()=>{
        await prisma.$disconnect();
});
