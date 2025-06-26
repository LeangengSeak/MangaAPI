import ContentModel from "../models/content.model";
import EpisodeModel from "../models/episode.model";
import MangaModel from "../models/manga.model";
import { ContentDto, EpisodeDto, MangaDto } from "../shared/interfaces/admin.interface";
import { BadRequestException, NotFoundExpection } from "../shared/utils/catch-errors";

export class AdminService {
  public async createContent(contentDto: ContentDto, imageUrl: string) {
    const { mangaId, episodeId } = contentDto;

    const newContent = new ContentModel({
      imageUrl,
      mangaId,
      episodeId,
    });

    await newContent.save();

    if (episodeId && mangaId) {
      await EpisodeModel.findByIdAndUpdate(episodeId, {
        $push: { imageContent: newContent._id },
        updatedAt: new Date(),
      });
    }

    return { content: newContent };
  }

  public async deleteContent(contentId: string) {
    const content = await EpisodeModel.findByIdAndDelete(contentId);
    if (!content) {
      throw new BadRequestException("Content not found or already deleted.");
    }
    return;
  }

  public async createEpisode(episodeDto: EpisodeDto, imageUrl: string) {
    const { chapter, title, mangaId } = episodeDto;

    const newEpisode = new EpisodeModel({
      chapter,
      title,
      coverImageUrl: imageUrl,
      mangaId,
    });

    await newEpisode.save();

    if (mangaId) {
      await MangaModel.findByIdAndUpdate(mangaId, {
        $push: { episodes: newEpisode._id },
        updatedAt: new Date(),
      });
    }

    return { episode: newEpisode };
  }

  public async deleteEpisode(episodeId: string) {
    const episode = await EpisodeModel.findByIdAndDelete(episodeId);
    if (!episode) {
      throw new BadRequestException("Episode not found or already deleted.");
    }
    return
  }

  public async createManga(mangaDto: MangaDto, imageUrl: string) {
    const { title, author, description } = mangaDto;
    const newManga = new MangaModel({
      title,
      author,
      coverImageUrl: imageUrl,
      description,
    });

    await newManga.save();

    return { manga: newManga };
  }

    public async deleteManga(mangaId: string) {
        const manga = await MangaModel.findByIdAndDelete(mangaId);
        
        if (!manga) {
            throw new BadRequestException("Manga not found or already deleted.");
        }

        return;
  }
}
