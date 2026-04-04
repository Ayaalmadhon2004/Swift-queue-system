import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: "postgresql://neondb_owner:npg_1kSsAORyB2pe@ep-soft-mountain-agriezl2-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  },
});