import { z } from 'zod';

export const ReviewInput = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
  professionalId: z.string().uuid(),
}); 