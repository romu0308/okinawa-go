import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    category: z.enum(['model-course', 'area-guide', 'food', 'activity', 'tips', 'seasonal']),
    area: z.enum(['naha', 'chatan', 'yomitan', 'onna', 'nago', 'motobu', 'south', 'island', 'multiple']).optional(),
    thumbnail: z.string(),
    thumbnailAlt: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { articles };
