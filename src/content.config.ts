import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const issues = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/issues' }),
  schema: z.object({
    title: z.string(),
    season: z.enum(['printemps', 'été', 'automne', 'hiver']),
    year: z.number().int(),
    publishDate: z.coerce.date(),
    description: z.string().optional(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    issue: reference('issues'),
    author: z.string().optional(),
  }),
});

export const collections = {
  issues,
  articles,
};
