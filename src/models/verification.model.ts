import mongoose, { Schema, Document } from "mongoose";
import { VerificationEum } from "../shared/enums/verification-code.enum";
import { generateUniqueCode } from "../shared/utils/uuid";

interface VerificationCodeDocument extends Document{
    userId: mongoose.Schema.Types.ObjectId;
    code: string;
    type: VerificationEum;
    createdAt: Date;
    expiresAt: Date;

}

const verificationCodeSchema = new Schema<VerificationCodeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    index: true,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
    default: generateUniqueCode,
  },
  type: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const verificationCodeModel = mongoose.model<VerificationCodeDocument>(
  "verificationCode",
  verificationCodeSchema,
  "verification_codes"
);

export default verificationCodeModel;