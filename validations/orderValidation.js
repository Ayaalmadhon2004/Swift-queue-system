import { z } from 'zod';

export const orderSchema = z.object({
    userId: z.string().min(3, "User ID must be at least 3 characters"),
    productId: z.string().uuid("Invalid Product ID format"), // يتوقع UUID مثلاً
});