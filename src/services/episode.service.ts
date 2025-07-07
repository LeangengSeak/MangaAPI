import EpisodeModel from "../models/episode.model";
import MangaModel from "../models/manga.model";
import { BadRequestException } from "../shared/utils/catch-errors";
import { Types } from 'mongoose'; // Import Types from mongoose

export class EpisodeService {
  public async getAllEpisodes(mangaId: string) {
    const episodes = await EpisodeModel.find(
      { mangaId },
      { __v: 0, imageContent: 0 }
    );

    if (!episodes || episodes.length === 0) {
      throw new BadRequestException("No episodes found for this manga");
    }

    return { episodes };
  }

  public async getEpisodeWithMangaById(episodeId: string, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID");
    }

    const episodeList = await EpisodeModel.find(
      { _id: episodeId },
      { __v: 0 }
    ).populate({ path: "imageContent", select: "imageUrl" });

    if (!episodeList || episodeList.length === 0) {
      throw new BadRequestException("Episode not found");
    }

    const episode = episodeList[0];

    const manga = await MangaModel.findById(episode.mangaId);

    if (!manga) {
      throw new BadRequestException("Manga not found for this episode");
    }

    const userObjectId = new Types.ObjectId(userId);

    if (!manga.viewedBy.includes(userObjectId)) {
      manga.views += 1;
      manga.viewedBy.push(userObjectId);
      await manga.save();
    }

    return { episode };
  }
}
