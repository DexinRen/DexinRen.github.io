import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Wiki pages synced from the Obsidian vault by `node scripts/sync-notes.mjs <vault>`.
// Do not edit these files by hand: edit the note in Obsidian and re-run the sync.
const wiki = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/wiki' }),
  schema: z.object({
    title: z.string(),
    area: z.string(),
    areaSlug: z.string(),
    tags: z.array(z.string()).default([]),
    order: z.number().default(9999),
    sources: z.array(z.string()),
    credits: z
      .array(
        z.object({
          text: z.string(),
          courseLink: z.string().url().nullable(),
          lectureLinks: z.array(z.object({ label: z.string(), url: z.string().url() })),
        }),
      )
      .default([]),
  }),
});

export const collections = { wiki };
