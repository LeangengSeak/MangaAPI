import mongoose, { Document, Schema } from "mongoose";
import { hashValue, compareValue } from "../shared/utils/bcrypt";

export interface UserPreferences {
  enable2FA: boolean;
  emailNotifications: boolean;
  twoFactorSecret?: string;
}

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  userPreferences: UserPreferences;
  // Methods
  comparePassword: (password: string) => Promise<boolean>;
}

const userPreferencesSchema = new Schema<UserPreferences>({
  enable2FA: {
    type: Boolean,
    default: false,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  twoFactorSecret: {
    type: String,
    required: false,
  },
});

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    userPreferences: { type: userPreferencesSchema, default: {} },
  },
  {
    timestamps: true,
    toJSON: {},
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashValue(this.password);
  }
  next();
});

userSchema.methods.comparePassword = async function (value: string) {
  return await compareValue(value, this.password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;  
    delete ret.__v;  
    delete ret.userPreferences.twoFactorSecret;  
    return ret;
  },
});


const UserModel = mongoose.model<UserDocument>("user", userSchema);

export default UserModel;
