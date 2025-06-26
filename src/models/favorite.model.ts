import mongoose, { Document, Schema } from "mongoose";

export interface FavoriteDocument extends Document { 
    userId: mongoose.Schema.Types.ObjectId;
    mangaId: mongoose.Schema.Types.ObjectId
    createdAt: Date;
    updatedAt: Date;
}

const favoriteSchema = new Schema<FavoriteDocument>({
    userId: {type: Schema.Types.ObjectId, ref: "user", required: true},
    mangaId: {type: Schema.Types.ObjectId, ref: "manga", required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

favoriteSchema.index({ userId: 1, mangaId: 1 }, { unique: true });

const FavoriteModel = mongoose.model<FavoriteDocument>("favorite", favoriteSchema);

export default FavoriteModel;