import { z } from 'zod';

export const orderSchema = z.object({
    userId: z.string()
        .min(3, "User ID must be at least 3 characters")
        .optional()
        .nullable(),

    productId: z.string()
        .uuid("Invalid Product ID format")
        .optional()
        .nullable(),

    customerName: z.string()
        .min(2, "الاسم قصير جداً")
        .max(50, "الاسم طويل جداً")
        .optional()
        .nullable(),
});