import MangaModel from "../models/manga.model";
import { ParamsManga } from "../shared/interfaces/admin.interface";
import { BadRequestException } from "../shared/utils/catch-errors";

export class MangaService {
  public async getAllMangas(query: ParamsManga) {
    const filter: any = {};

    if (query.title) filter.title = { $regex: query.title, $options: "i" };

    if (query.author) filter.author = { $regex: query.author, $options: "i" };

    const mangas = await MangaModel.find(
      filter,
      {
        viewedBy: 0,
        __v: 0,
      },
      {
        sort: { createdAt: -1 },
      }
    ).populate({
      path: "episodes",
      select: "chapter -_id",
      options: {
        sort: { createdAt: -1 },
        limit: 1,
      },
    });

    if (!mangas || mangas.length === 0) {
      throw new BadRequestException("No mangas found");
    }

    return { mangas };
  }

  public async getMangaById(mangaId: string) {
    const manga = await MangaModel.findById(mangaId, {
      viewedBy: 0,
      __v: 0,
    }).populate({ path: "episodes", select: "-imageContent -__v" });

    if (!manga) {
      throw new BadRequestException("Manga not found");
    }

    return manga;
  }
}
