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

const spots = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/spots' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(['restaurant', 'cafe', 'beach', 'activity', 'hotel', 'shopping', 'cultural']),
    area: z.enum(['naha', 'chatan', 'yomitan', 'onna', 'nago', 'motobu', 'south', 'island']),
    address: z.string(),
    phone: z.string().optional(),
    hours: z.string().optional(),
    closed: z.string().optional(),
    budget: z.string().optional(),
    parking: z.string().optional(),
    mapUrl: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string(),
    recommended: z.boolean().default(false),
    affiliateType: z.enum(['hotel', 'activity', 'car', 'none']).default('none'),
  }),
});

export const collections = { articles, spots };
