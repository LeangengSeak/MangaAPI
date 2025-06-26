import mongoose, { Document, Schema } from "mongoose";

export interface EpisodeDocument extends Document { 
  chapter: string;
  title?: string;
  coverImageUrl: string;
  imageContent: mongoose.Schema.Types.ObjectId[];
  mangaId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const episodeSchema = new Schema<EpisodeDocument>({
  chapter: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  coverImageUrl: {
    type: String,
    required: true,
  },
  imageContent: [{ type: Schema.Types.ObjectId, ref: "content" }],
  mangaId: {
    type: Schema.Types.ObjectId,
    ref: "manga",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const EpisodeModel = mongoose.model<EpisodeDocument>("episode", episodeSchema);

export default EpisodeModel;
