import EpisodeModel from "../models/episode.model";
import { BadRequestException } from "../shared/utils/catch-errors";

export class EpisodeService{
    public async getAllEpisodes(mangaId: string) { 
        const episodes = await EpisodeModel.find(
          { mangaId },
          { __v: 0, imageContent: 0},
        );

        if (!episodes || episodes.length === 0) {
            throw new BadRequestException("No episodes found for this manga");
        }

        return { episodes };
    }

    public async getEpisodeById(episodeId: string, userId: string) { 
        const episode = await EpisodeModel.find(
          { _id: episodeId },
            {
            __v: 0,
          }
        ).populate({ path: "imageContent", select: "imageUrl" });

        if (!episode) {
            throw new BadRequestException("Episode not found");
        }

        return { episode };
        
    }
}