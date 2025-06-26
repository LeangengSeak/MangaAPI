import { z } from "zod";

export const ContentSchema = z.object({
  mangaId: z.string().min(1).max(255),
  episodeId: z.string().min(1).max(255),
});

export const EpisodeSchema = z.object({
  chapter: z.string().min(1).max(255),
  title: z.string().optional(),
  mangaId: z.string().min(1).max(255),
});

export const MangaSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  description: z.string().min(1).max(512),
})