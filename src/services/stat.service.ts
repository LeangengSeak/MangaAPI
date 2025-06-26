import ContentModel from "../models/content.model";
import EpisodeModel from "../models/episode.model";
import MangaModel from "../models/manga.model";
import UserModel from "../models/user.model";

export class StatService {
  public async getStats() {
    const [totalManga, totalEpisode, totalContent, totalUser, uniqueAuthors] =
      await Promise.all([
        MangaModel.countDocuments({}),
        EpisodeModel.countDocuments({}),
        ContentModel.countDocuments({}),
        UserModel.countDocuments({}),
        MangaModel.aggregate([
          {
            $group: {
              _id: {
                $toLower: { $trim: { input: "$author" } },
              },
            },
          },
          {
            $count: "count",
          },
        ]),
      ]);

    const totalUniqueAuthors = uniqueAuthors[0]?.count || 0;
      

    return {
      totalManga,
      totalEpisode,
      totalContent,
      totalUser,
      totalUniqueAuthors,
    };
  }
}
