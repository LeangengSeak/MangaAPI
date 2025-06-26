import mongoose, { Document, Schema } from "mongoose";

export interface MangaDocument extends Document {
  title: string;
  author: string;
  coverImageUrl: string;
  description: string;
  views: number;
  episodes: { episodeId: mongoose.Schema.Types.ObjectId }[];
  viewedBy: { userId: mongoose.Schema.Types.ObjectId }[];
  createdAt: Date;
  updatedAt: Date;
}

const mangaSchema = new Schema<MangaDocument>({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  coverImageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  episodes: [{ type: Schema.Types.ObjectId, ref: "episode" }],
  viewedBy: [{ type: Schema.Types.ObjectId, ref: "user" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const MangaModel = mongoose.model<MangaDocument>("manga", mangaSchema);

export default MangaModel;
