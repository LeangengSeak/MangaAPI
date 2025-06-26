import { Router } from "express";
import { FavoriteService } from "../services/favorite.service";
import { FavoriteController } from "../controllers/favorite.controller";

const favoriteService = new FavoriteService();
const favoriteController = new FavoriteController(favoriteService);

const favoriteRoutes = Router();

favoriteRoutes.get('/', favoriteController.getFavorites)
favoriteRoutes.post('/', favoriteController.addFavorite)
favoriteRoutes.delete('/:id', favoriteController.removeFavorite)

export default favoriteRoutes;