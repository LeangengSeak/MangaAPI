import FavoriteModel from "../models/favorite.model";
import { BadRequestException } from "../shared/utils/catch-errors";

export class FavoriteService{
    async addFavorite(userId: string, mangaId: string) {
        const favorite = await FavoriteModel.create({
            userId,
            mangaId
        })
        
        return favorite;
    }

    async removeFavorite(userId: string, favoriteId: string) {
        const favorite = await FavoriteModel.findOneAndDelete({
            userId,
            _id: favoriteId
        });

        if (!favorite) {
            throw new BadRequestException("Favorite not found");
        }

        return 
   
    }

    async getFavorites(userId: string) {
        const favorites = await FavoriteModel.find({ userId })
          .populate("mangaId", "title coverImageUrl author _id")
          .select("-__v");

        if (!favorites || favorites.length === 0) {
            throw new BadRequestException("No favorites found for this user");
        }

        return favorites;
    }
}