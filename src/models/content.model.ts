import mongoose, { Document, Schema } from "mongoose";

export interface ContentDocument extends Document {
  imageUrl: string;
  mangaId: mongoose.Schema.Types.ObjectId;
  episodeId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<ContentDocument>({
  imageUrl: {
    type: String,
    required: true,
  },
  mangaId: { type: Schema.Types.ObjectId, ref: "manga", required: true },
  episodeId: { type: Schema.Types.ObjectId, ref: "episode", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ContentModel = mongoose.model<ContentDocument>("content", contentSchema);

export default ContentModel;
