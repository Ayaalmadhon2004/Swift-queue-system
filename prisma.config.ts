import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // تأكدي من إضافة هذا السطر لتحميل المتغيرات

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});